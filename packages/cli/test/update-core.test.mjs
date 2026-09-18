import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makePlan } from '../dist/update/planner.js';
import { applyPlan, rollback, safePath, validBackupId } from '../dist/update/backup.js';
import { skipExisting, validateRules, validateConfig, sourceMode, excluded } from '../dist/update/rules.js';
import { currentVersion, selectVersion, unpackTemplate } from '../dist/update/template.js';
import { gzipSync } from 'node:zlib';
import ts from 'typescript';
function fixture() {
 const dir=mkdtempSync(join(tmpdir(),'meadmin-update-test-'));
 const paths={root:join(dir,'project'),base:join(dir,'base'),target:join(dir,'target')};Object.values(paths).forEach(p=>mkdirSync(p));
 const put=(where,path,text)=>{mkdirSync(join(paths[where],path,'..'),{recursive:true});writeFileSync(join(paths[where],path),text);};return {...paths,put};
}
test('当前版本读取本地core，不受cli或业务版本影响',()=>{
 const f=fixture();
 f.put('root','package.json',JSON.stringify({version:'9.0.0',dependencies:{'@meadmin/core':'^1.0.0','@meadmin/cli':'^2.0.0'}}));
 for(const [name,version] of [['core','1.3.6'],['cli','2.0.0']]) {
  f.put('root',`node_modules/@meadmin/${name}/package.json`,JSON.stringify({name:`@meadmin/${name}`,version,main:'index.js'}));
  f.put('root',`node_modules/@meadmin/${name}/index.js`,'');
 }
 assert.equal(currentVersion(f.root),'1.3.6');
});
test('缺少本地core时不回退到cli',()=>{
 const f=fixture();
 f.put('root','package.json','{}');
 f.put('root','node_modules/@meadmin/cli/package.json',JSON.stringify({name:'@meadmin/cli',version:'1.0.0',main:'index.js'}));
 f.put('root','node_modules/@meadmin/cli/index.js','');
 assert.throws(()=>currentVersion(f.root),/@meadmin\/core/);
});
test('清单与旧模板相同时仍将本地1.3.6对齐1.3.8，gitignore追加并幂等',()=>{
 const f=fixture();
 const target=JSON.stringify({dependencies:{'@meadmin/cli':'~1.3.8','@meadmin/core':'~1.3.8'}});
 f.put('base','packageTemplate.json',target);f.put('target','packageTemplate.json',target);
 f.put('root','package.json',JSON.stringify({name:'business',scripts:{dev:'custom'},dependencies:{'@meadmin/cli':'~1.3.6','@meadmin/core':'~1.3.6',custom:'1.0.0'}}));
 f.put('base','.gitignore','dist/\n.env\n');f.put('target','.gitignore','dist/\n.env\n');f.put('root','.gitignore','# local\r\ncustom/\r\n!keep\r\ndist/');
 const plan=makePlan(f.root,f.base,f.target,'1.3.8',{});
 const pkg=JSON.parse(plan.changes.find(c=>c.path==='package.json').content.toString());
 assert.equal(pkg.dependencies['@meadmin/cli'],'~1.3.8');assert.equal(pkg.dependencies['@meadmin/core'],'~1.3.8');assert.equal(pkg.dependencies.custom,'1.0.0');assert.equal(pkg.scripts.dev,'custom');
 const ignore=plan.changes.find(c=>c.path==='.gitignore');assert.equal(ignore.action,'merge');assert.equal(ignore.content.toString(),'# local\r\ncustom/\r\n!keep\r\ndist/\r\n.env\r\n');
 applyPlan(f.root,plan,'1.3.6','1.3.8');assert.equal(makePlan(f.root,f.base,f.target,'1.3.8',{}).changes.length,0);
});
test('历史备份仅位于node_modules内且可回滚',()=>{
 const f=fixture();f.put('root','a.ts','old');f.put('base','a.ts','old');f.put('target','a.ts','new');
 const directory=applyPlan(f.root,makePlan(f.root,f.base,f.target,'1.3.8',{}),'1.3.6','1.3.8');
 assert.ok(directory.startsWith(join(f.root,'node_modules/.meadmin/updates')));
 assert.equal(existsSync(join(f.root,'.meadmin')),false);
 assert.ok(existsSync(join(directory,'record.json')));
 rollback(f.root,directory);assert.equal(readFileSync(join(f.root,'a.ts'),'utf8'),'old');
});
test('批次目录包含版本，同版本重复升级互不覆盖，兼容旧UUID',()=>{
 const f=fixture();const empty={changes:[],skipped:[],manual:[],sqlTables:[]};
 const a=applyPlan(f.root,empty,'1.3.6','1.3.8');const b=applyPlan(f.root,empty,'1.3.6','1.3.8');
 assert.notEqual(a,b);assert.ok(a.includes('v1.3.6_to_v1.3.8_'));rollback(f.root,a);rollback(f.root,b);
 assert.ok(validBackupId('12345678-1234-1234-1234-123456789abc'));
 assert.ok(!validBackupId('../v1.3.6_to_v1.3.8_x'));assert.ok(!validBackupId('v1.3.8'));
});
test('旧模板已包含dataScope时仍补齐本地缺失字段与完整装饰器',()=>{
 const f=fixture();const path='src/entities/systemRole.entity.ts';
 const head="import { Attribute } from '@sequelize/core/decorators-legacy';\nimport { DataTypes } from '@sequelize/core';\nimport { ApiPropertyRule } from '@/decorators/index.js';\nimport { RuleType } from '@/ruleType/index.js';\n";
 const field="@Attribute({comment:'数据权限:1=全部;2=组织;3=组织及以下;4=仅本人',defaultValue:3,allowNull:false,type:DataTypes.TINYINT.UNSIGNED})\n@ApiPropertyRule({description:'数据权限',rule:RuleType.number().valid(1,2,3,4).default(3)})\ndataScope: number;";
 const target=head+'export class SystemRole { '+field+' }';
 f.put('base',path,target);f.put('target',path,target);f.put('root',path,head+'export class SystemRole { custom = 1; }');
 const plan=makePlan(f.root,f.base,f.target,'1.3.8',{});const change=plan.changes.find(c=>c.path===path);assert.ok(change);assert.equal(change.action,'merge');
 assert.ok(change.content.toString().includes(field));assert.match(change.content.toString(),/custom = 1/);
 applyPlan(f.root,plan,'1.3.8','1.3.8');assert.equal(makePlan(f.root,f.base,f.target,'1.3.8',{}).changes.length,0);
});
test('ruleType默认按validation合并，同版本目标未变仍更新，false与skipExisting可覆盖',()=>{
 const f=fixture(),path='src/ruleType/string.ts';
 const target=readFileSync(new URL('../../../src/ruleType/string.ts',import.meta.url),'utf8');
 const local=target.replace('mobile(): this;', 'mobile(legacy?: boolean): this; custom(): this;').replace('rules: {', 'rules: { custom: { validate(value) { return value; } },').replace("'string.mobile': '{{#label}} must be a true mobile'", "'string.mobile': 'custom mobile'")+'\nexport const localOnly = 1;';
 f.put('base',path,target);f.put('target',path,target);f.put('root',path,local);
 const plan=makePlan(f.root,f.base,f.target,'1.3.8',{});const item=plan.changes.find(x=>x.path===path);
 assert.equal(item.action,'merge');assert.match(item.content.toString(),/phone\(\): this/);assert.match(item.content.toString(),/custom\(\): this/);assert.match(item.content.toString(),/localOnly/);assert.doesNotMatch(item.content.toString(),/legacy|custom mobile/);
 for(const mode of [false,'overwrite']) assert.equal(makePlan(f.root,f.base,f.target,'1.3.8',{}, {[path]:mode}).changes.find(c=>c.path===path).content.toString(),target);
 assert.equal(makePlan(f.root,f.base,f.target,'1.3.8',{[path]:true}).changes.length,0);
 applyPlan(f.root,plan,'1.3.8','1.3.8');assert.equal(makePlan(f.root,f.base,f.target,'1.3.8',{}).changes.length,0);
});
test('validation默认通配、index精确false、用户策略覆盖和配置校验',()=>{
 assert.equal(sourceMode('src/ruleType/string.ts'),'validation');
 assert.equal(sourceMode('src/ruleType/nested/number.ts'),'validation');
 assert.equal(sourceMode('src/ruleType/index.ts'),false);
 assert.equal(sourceMode('src/ruleType/string.ts',{'src/ruleType/**/*.ts':'functions'}),'functions');
 assert.equal(sourceMode('src/ruleType/index.ts',{'src/ruleType/index.ts':'exports'}),'exports');
 assert.deepEqual(validateConfig({mergeSource:{'src/custom.ts':'validation'}}).mergeSource,{'src/custom.ts':'validation'});
 const f=fixture(),path='src/ruleType/index.ts';
 const target="export { phone } from './string.js';";
 f.put('target',path,target);f.put('base',path,target);f.put('root',path,"export { custom } from './custom.js';");
 const plan=makePlan(f.root,f.base,f.target,'1.3.8',{});
 assert.equal(plan.changes[0].action,'overwrite');assert.equal(plan.changes[0].content.toString(),target);
 assert.equal(makePlan(f.root,f.base,f.target,'1.3.8',{}, {[path]:'exports'}).changes[0].action,'merge');
});
test('validation动态结构仅提示人工，不回退覆盖；新增文件直接创建',()=>{
 const f=fixture(),path='src/ruleType/string.ts';
 const target=readFileSync(new URL('../../../src/ruleType/string.ts',import.meta.url),'utf8');
 f.put('target',path,target);f.put('root',path,'export const initRuleType = () => null;');
 const plan=makePlan(f.root,f.base,f.target,'1.3.8',{});
 assert.equal(plan.changes.length,0);assert.match(plan.manual.join(),/validation/);
 f.put('target','src/ruleType/nested/string.ts',target);
 assert.equal(makePlan(f.root,f.base,f.target,'1.3.8',{}).changes[0].action,'create');
});
test('同主版本最新稳定，指定跨主版本，拒绝降级',()=>{
 const versions={'1.3.6':{},'1.4.0':{},'1.5.0':{deprecated:'bad'},'1.6.0-beta.1':{},'2.0.0':{}};
 assert.equal(selectVersion('1.3.6',versions),'1.4.0');assert.equal(selectVersion('1.3.6',versions,'2.0.0'),'2.0.0');assert.throws(()=>selectVersion('2.0.0',versions,'1.4.0'));
});
test('跳过存在文件规则和false精确覆盖、JSON默认排除',()=>{
 assert.equal(skipExisting('view/admin/src/views/index/index.vue'),true);
 assert.equal(skipExisting('view/admin/src/views/index/index.vue',{'view/admin/src/views/index/index.vue':false}),false);
 for(const path of ['.workbuddy/memory/a.md','.GIT/config','node_modules/a','dist/a','logs/a','.meadmin/a','nested/DIST/a','pnpm-lock.yaml','nested/package-lock.json','yarn.lock','build.tsbuildinfo']) assert.equal(excluded(path),true,path);
 for(const path of ['uploadFile','uploadFile/default.png','nested/uploadFile/default.png','uploadfile/default.png','nested/UPLOADFILE/default.png']) assert.equal(excluded(path),false,path);
 assert.equal(skipExisting('view/admin/src/views/index/components/a.vue',{'view/admin/src/views/index/components/**':false}),false);
 assert.equal(skipExisting('view/admin/src/views/index/index.vue',{'view/admin/src/views/*/index.vue':false}),false);
 assert.throws(()=>skipExisting('view/admin/src/views/index/index.vue',{'view/admin/src/views/*/index.vue':false,'view/admin/src/views/index/*.vue':true}),/冲突/);
 assert.throws(()=>validateRules({skipExisting:{'../x':false}}));
});
test('uploadFile 默认仅保护项目根路径，用户 false 沿用同模式、子目录及精确规则优先级', () => {
  assert.equal(skipExisting('uploadFile/default.png'), true);
  assert.equal(skipExisting('uploadFile/images/default.png'), true);
  assert.equal(skipExisting('nested/uploadFile/default.png'), false);
  assert.equal(skipExisting('uploadfile/default.png'), false);
  for (const pattern of ['uploadFile/**', 'uploadFile/images/**', 'uploadFile/images/default.png']) {
    assert.equal(skipExisting('uploadFile/images/default.png', { [pattern]: false }), false);
  }
  assert.equal(skipExisting('uploadFile/default.png', { 'uploadFile/images/**': false }), true);
});

test('uploadFile 缺失二进制逐字节创建，包含新目录及已有目录中的缺失文件', t => {
  const f = fixture();
  t.after(() => rmSync(join(f.root, '..'), { recursive: true, force: true }));
  const binary = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0xff, 0x80, 0xc3, 0x28, 13, 10]);
  const paths = ['uploadFile/default.png', 'uploadFile/images/nested/default.png'];
  for (const path of paths) { f.put('base', path, binary); f.put('target', path, binary); }
  for (const path of paths) assert.equal(safePath(f.root, path), join(f.root, path));
  const plan = makePlan(f.root, f.base, f.target, '1.3.11', {});
  assert.equal(plan.changes.length, 2);
  for (const change of plan.changes) {
    assert.equal(change.action, 'create');
    assert.equal(change.previous, null);
    assert.deepEqual(change.content, binary);
    assert.equal(existsSync(join(f.root, change.path)), false);
  }
  applyPlan(f.root, plan, '1.3.11', '1.3.11');
  for (const path of paths) assert.deepEqual(readFileSync(join(f.root, path)), binary);
  f.put('target', 'uploadFile/images/added.png', binary);
  const added = makePlan(f.root, f.base, f.target, '1.3.11', {});
  assert.deepEqual(added.changes.map(change => [change.path, change.action]), [['uploadFile/images/added.png', 'create']]);
  applyPlan(f.root, added, '1.3.11', '1.3.11');
  assert.deepEqual(readFileSync(join(f.root, 'uploadFile/images/added.png')), binary);
  assert.equal(makePlan(f.root, f.base, f.target, '1.3.11', {}).changes.length, 0);
});

test('uploadFile 已存在的不同二进制和空文件默认跳过，内容不变', t => {
  const f = fixture();
  t.after(() => rmSync(join(f.root, '..'), { recursive: true, force: true }));
  const target = Buffer.from([0, 0xff, 0x80, 1]);
  const files = [['uploadFile/default.png', Buffer.from([0xfe, 0, 0x81, 2])], ['uploadFile/images/empty.png', Buffer.alloc(0)]];
  for (const [path, local] of files) {
    f.put('root', path, local); f.put('base', path, target); f.put('target', path, target);
  }
  const plan = makePlan(f.root, f.base, f.target, '1.3.11', {});
  assert.deepEqual(plan.changes, []);
  assert.deepEqual(plan.skipped.sort(), files.map(([path]) => path + ': 存在时跳过').sort());
  applyPlan(f.root, plan, '1.3.11', '1.3.11');
  for (const [path, local] of files) assert.deepEqual(readFileSync(join(f.root, path)), local);
});

test('uploadFile 本地独有及模板已移除文件不删除，不误匹配其他目录同名文件', t => {
  const f = fixture();
  t.after(() => rmSync(join(f.root, '..'), { recursive: true, force: true }));
  const local = Buffer.from([0xff, 0, 0x81]), target = Buffer.from([0x80, 1, 0]);
  const preserved = ['uploadFile/local-only.png', 'uploadFile/removed.png', 'other/default.png'];
  for (const path of preserved) f.put('root', path, local);
  f.put('base', 'uploadFile/removed.png', target);
  f.put('target', 'uploadFile/default.png', target);
  const plan = makePlan(f.root, f.base, f.target, '1.3.11', {});
  assert.deepEqual(plan.changes.map(change => [change.path, change.action]), [['uploadFile/default.png', 'create']]);
  assert.ok(plan.manual.includes('uploadFile/removed.png: 目标模板已移除，本地不会删除'));
  applyPlan(f.root, plan, '1.3.11', '1.3.11');
  for (const path of preserved) assert.deepEqual(readFileSync(join(f.root, path)), local);
  assert.deepEqual(readFileSync(join(f.root, 'uploadFile/default.png')), target);
});

for (const pattern of ['uploadFile/**', 'uploadFile/images/**', 'uploadFile/images/default.png']) test(`uploadFile 显式 false 允许二进制覆盖：${pattern}`, t => {
  const f = fixture();
  t.after(() => rmSync(join(f.root, '..'), { recursive: true, force: true }));
  const path = 'uploadFile/images/default.png';
  const local = Buffer.from([0xff, 0, 0x81]), target = Buffer.from([0x80, 1, 0]);
  f.put('root', path, local); f.put('base', path, target); f.put('target', path, target);
  f.put('root', 'uploadFile/local-only.png', local);
  const rules = validateRules({ skipExisting: { [pattern]: false } });
  const plan = makePlan(f.root, f.base, f.target, '1.3.11', rules);
  assert.equal(plan.changes.length, 1);
  assert.equal(plan.changes[0].action, 'overwrite');
  assert.equal(plan.changes[0].conflict, true);
  assert.deepEqual(plan.changes[0].content, target);
  assert.deepEqual(plan.skipped, []);
  applyPlan(f.root, plan, '1.3.11', '1.3.11');
  assert.deepEqual(readFileSync(join(f.root, path)), target);
  assert.deepEqual(readFileSync(join(f.root, 'uploadFile/local-only.png')), local);
  assert.equal(makePlan(f.root, f.base, f.target, '1.3.11', rules).changes.length, 0);
});

test('uploadFile 备份保留原始二进制，rollback 恢复覆盖项并移除新增项，保护项及本地独有不变', t => {
  const f = fixture();
  t.after(() => rmSync(join(f.root, '..'), { recursive: true, force: true }));
  const local = Buffer.from([0xff, 0, 0x81]), target = Buffer.from([0x80, 1, 0]);
  for (const path of ['uploadFile/overwrite.png', 'uploadFile/protected.png', 'uploadFile/local-only.png']) f.put('root', path, local);
  for (const path of ['uploadFile/overwrite.png', 'uploadFile/protected.png', 'uploadFile/new/image.png']) {
    f.put('base', path, target); f.put('target', path, target);
  }
  const plan = makePlan(f.root, f.base, f.target, '1.3.11', { 'uploadFile/overwrite.png': false });
  assert.equal(plan.changes.length, 2);
  assert.deepEqual(plan.skipped, ['uploadFile/protected.png: 存在时跳过']);
  const directory = applyPlan(f.root, plan, '1.3.11', '1.3.11');
  const record = JSON.parse(readFileSync(join(directory, 'record.json'), 'utf8'));
  assert.equal(record.phase, 'files-complete');
  assert.deepEqual(record.files.map(file => file.path).sort(), ['uploadFile/new/image.png', 'uploadFile/overwrite.png']);
  assert.ok(record.files.every(file => file.state === 'written'));
  assert.equal(record.files.find(file => file.path === 'uploadFile/new/image.png').before, null);
  assert.deepEqual(readFileSync(join(directory, 'original/uploadFile/overwrite.png')), local);
  for (const path of ['uploadFile/overwrite.png', 'uploadFile/new/image.png']) {
    assert.deepEqual(readFileSync(join(directory, 'target', path)), target);
    assert.deepEqual(readFileSync(join(f.root, path)), target);
  }
  for (const path of ['uploadFile/protected.png', 'uploadFile/local-only.png']) assert.deepEqual(readFileSync(join(f.root, path)), local);
  rollback(f.root, directory);
  assert.equal(existsSync(join(f.root, 'uploadFile/new/image.png')), false);
  for (const path of ['uploadFile/overwrite.png', 'uploadFile/protected.png', 'uploadFile/local-only.png']) assert.deepEqual(readFileSync(join(f.root, path)), local);
  assert.equal(JSON.parse(readFileSync(join(directory, 'record.json'), 'utf8')).phase, 'rolled-back');
});

test('源码策略由配置读取，精确false优先，不把实现目录误认导出集成',()=>{
 assert.equal(sourceMode('src/filter/badRequest.filter.ts'),undefined);
 assert.equal(sourceMode('src/filter/index.ts'),'exports');
 assert.equal(sourceMode('view/admin/src/utils/helper.ts'),'functions');
 assert.equal(sourceMode('view/admin/src/utils/helper.ts',{'view/admin/src/utils/helper.ts':false}),false);
 assert.throws(()=>validateConfig({mergeSource:{'src/a.ts':'invalid'}}));
 assert.deepEqual(validateConfig({mergeSource:{'src/x.ts':'exports'}}).mergeSource,{'src/x.ts':'exports'});
});
test('planner集成函数合并和静态注册识别，关闭规则才整文件覆盖',()=>{
 const f=fixture();const path='view/admin/src/api/a.ts';
 const base='export function a(){return 1;}';const local=base+'\nexport function custom(){return 9;}';const target='export function a(){return 2;}\nexport const added=()=>3;';
 f.put('base',path,base);f.put('root',path,local);f.put('target',path,target);
 const merged=makePlan(f.root,f.base,f.target,'1.4.0',{}).changes.find(c=>c.path===path);
 assert.equal(merged.action,'merge');assert.match(merged.content.toString(),/custom/);assert.match(merged.content.toString(),/added/);
 assert.equal(makePlan(f.root,f.base,f.target,'1.4.0',{}, {[path]:false}).changes.find(c=>c.path===path).content.toString(),target);
 const index='src/registry/index.ts';f.put('base',index,"export { a } from './a';");f.put('root',index,"export { a } from './a';\nexport { mine } from './mine';");f.put('target',index,"export { a } from './a';\nexport { b } from './b';");
 const result=makePlan(f.root,f.base,f.target,'1.4.0',{}).changes.find(c=>c.path===index);
 assert.equal(result.action,'merge');assert.match(result.content.toString(),/mine/);assert.match(result.content.toString(),/ b /);
 assert.equal(makePlan(f.root,f.base,f.target,'1.4.0',{}, {[index]:false}).changes.find(c=>c.path===index).action,'overwrite');
});
test('同版本 planner 的 API/utils/helper 全部默认路径按函数合并且重复幂等',()=>{
 const f=fixture();
 const paths=['src','view/admin/src','view/index/src'].flatMap(root=>['api','utils','helper'].flatMap(kind=>[`${root}/${kind}/helper.ts`,`${root}/${kind}/nested/helper.ts`]));
 const target='export function same(){return 1;} export const added=()=>2; export class Demo { run(){return 3;} }';
 const local='export function same(){return 10;} export const localOnly=()=>20; export class Demo { run(){return 30;} localOnly(){return 40;} }';
 for(const path of paths) { assert.equal(sourceMode(path),'functions'); f.put('base',path,target); f.put('target',path,target); f.put('root',path,local); }
 const plan=makePlan(f.root,f.base,f.base,'1.3.11',{});
 assert.equal(plan.changes.length,paths.length);
 for(const change of plan.changes) {
  assert.equal(change.action,'merge');assert.equal(change.conflict,true);
  assert.match(change.content.toString(),/same\(\)\{return 1;\}/);assert.match(change.content.toString(),/added=\(\)=>2/);
  assert.match(change.content.toString(),/run\(\)\{return 3;\}/);assert.match(change.content.toString(),/localOnly=\(\)=>20/);assert.match(change.content.toString(),/localOnly\(\)\{return 40;\}/);
 }
 applyPlan(f.root,plan,'1.3.11','1.3.11');
 assert.equal(makePlan(f.root,f.base,f.base,'1.3.11',{}).changes.length,0);
});
test('真实前后台 helper、配置 API 和后端 utils 在临时副本中同版本覆盖并幂等',()=>{
 const f=fixture();
 const cases=[
  ['view/admin/src/utils/helper.ts',['isImage','fileToHump','statusToBoolean','concatObjectValue','listToTree','proxyValue','getDict']],
  ['view/index/src/utils/helper.ts',['isImage','fileToHump','statusToBoolean','concatObjectValue','listToTree','proxyValue','getDict']],
  ['src/helper/utils.ts',['extractBracesContent','formatText']],
  ['view/admin/src/api/config.ts',['getConfigApi','getDictApi']],
  ['view/index/src/api/config.ts',['getConfigApi','getDictApi']],
 ];
 const units=text=>{
  const file=ts.createSourceFile('fixture.ts',text,ts.ScriptTarget.Latest,true);
  assert.equal(file.parseDiagnostics.length,0);
  return new Map(file.statements.flatMap(node=>ts.isFunctionDeclaration(node)?[[node.name.text,node]]:ts.isVariableStatement(node)?[...node.declarationList.declarations].filter(item=>item.initializer&&(ts.isArrowFunction(item.initializer)||ts.isFunctionExpression(item.initializer))).map(item=>[item.name.text,item]):[]));
 };
 const targets=new Map();
 for(const [path,names] of cases) {
  const target=readFileSync(new URL('../../../'+path,import.meta.url),'utf8');targets.set(path,target);
  let local=target;
  for(const name of names) {
   const node=units(local).get(name);assert.ok(node,`${path}: ${name}`);
   const body=ts.isFunctionDeclaration(node)?node.body:node.initializer.body;
   local=local.slice(0,body.getStart())+'{ throw new Error("本地定制"); }'+local.slice(body.end);
  }
  const added=units(local).get(names.at(-1));assert.ok(ts.isFunctionDeclaration(added));local=local.slice(0,added.getStart())+local.slice(added.end);
  local+='\n// 本地独有\nexport function localOnly(){ return 789; }\n';
  f.put('root',path,local);f.put('base',path,target);f.put('target',path,target);
 }
 const plan=makePlan(f.root,f.base,f.target,'1.3.11',{});
 assert.equal(plan.changes.length,cases.length,plan.manual.join('\n'));
 for(const [path,names] of cases) {
  const change=plan.changes.find(item=>item.path===path);assert.equal(change.action,'merge');
  const output=units(change.content.toString()),target=units(targets.get(path));
  for(const name of names) assert.equal(output.get(name)?.getText(),target.get(name).getText(),`${path}: ${name}\n${plan.manual.join('\n')}`);
  assert.equal(output.get('localOnly').getText(),'export function localOnly(){ return 789; }');
  assert.doesNotMatch(change.content.toString(),/本地定制/);
 }
 applyPlan(f.root,plan,'1.3.11','1.3.11');
 assert.equal(makePlan(f.root,f.base,f.target,'1.3.11',{}).changes.length,0);
});
test('planner 函数同文本但 import 来源改变必须报告人工，不能无声跳过',()=>{
 const f=fixture(),path='view/admin/src/utils/helper.ts';
 const local="import { dep } from './local.js'; export function f(){return dep;}";
 const target="import { dep } from './target.js'; export function f(){return dep;}";
 f.put('root',path,local);f.put('base',path,target);f.put('target',path,target);
 const plan=makePlan(f.root,f.base,f.target,'1.3.11',{});
 assert.equal(plan.changes.length,0);assert.match(plan.manual.join(),/函数 f.*import dep.*冲突/);
 assert.equal(readFileSync(join(f.root,path),'utf8'),local);
});
test('planner 旧目标相同或缺失无效基线时，各专用策略和人工提示均按本地目标判定',()=>{
 const validation=readFileSync(new URL('../../../src/ruleType/string.ts',import.meta.url),'utf8');
 const localValidation=validation.replace('mobile(): this;', 'mobile(legacy?: boolean): this;').replace("'string.mobile': '{{#label}} must be a true mobile'", "'string.mobile': 'local mobile'");
 const cases=[
  ['ordinary.txt','本地','目标','overwrite'],
  ['src/utils/helper.ts','export const limit = 10; export type Shape = string; export class Demo<T> { value = 10; run(){return 20;} } export function f(){return 30;}','export const limit = 1; export type Shape = number; export class Demo { value = 1; run(){return 2;} } export function f(){return 3;}','merge'],
  ['src/entities/user.ts','@Table("local") export class User { value = 10; localOnly = 20; }','@Table("target") export class User { value = 1; added = 2; }','merge'],
  ['src/ruleType/string.ts',localValidation,validation,'merge'],
  ['src/config/default.ts','export default { port: 10, nested: { local: true } };','export default { port: 1, nested: { added: true } };','merge'],
  ['pnpm-workspace.yaml','packages: [local]\noverrides: { old: "10" }\n','packages: [target]\noverrides: { old: "1", added: "2" }\n','merge'],
  ['tsconfig.json','{"compilerOptions":{"strict":false}}','{"compilerOptions":{"strict":true,"skipLibCheck":true}}','merge'],
  ['.env','VALUE=local\n','VALUE=target\nADDED=yes\n','merge'],
  ['view/index/src/router/routes.ts','export const routes = [{path: "/same", meta: {value: "local"}}]; function helper(){return 10;}','export const routes = [{path: "/same", meta: {value: "target"}}, {path: "/added"}]; function helper(){return 1;}','merge'],
  ['src/filter/index.ts',"export { local } from './local.js';", "export { target } from './target.js';",'merge'],
 ];
 for(const baseline of ['target','invalid','missing']) {
  const f=fixture();
  for(const [path,local,target] of cases) {
   f.put('root',path,local);f.put('target',path,target);
   if(baseline!=='missing') f.put('base',path,baseline==='target'?target:'export class {');
  }
  f.put('root','identical.txt','相同');f.put('target','identical.txt','相同');
  f.put('root','only-local.txt','独有');f.put('root','removed.txt','保留');f.put('base','removed.txt','旧');
  f.put('root','different/created.txt','同名不同路径保留');f.put('target','created.txt','创建');f.put('base','created.txt','创建');
  f.put('root','protected.txt','受保护');f.put('target','protected.txt','目标');f.put('base','protected.txt','目标');
  f.put('target','protected-new.txt','缺失仍创建');
  const rules={'protected*.txt':true};
  const plan=makePlan(f.root,f.base,f.target,'1.3.11',rules);
  assert.equal(plan.changes.length,cases.length+2,plan.manual.join('\n'));
  for(const [path,,target,action] of cases) {
   const change=plan.changes.find(item=>item.path===path);assert.ok(change,path);assert.equal(change.action,action,path);
   if(action==='overwrite') assert.equal(change.content.toString(),target);
  }
  const content=path=>plan.changes.find(item=>item.path===path).content.toString();
  const helper=content('src/utils/helper.ts');
  assert.match(helper,/limit = 10/);assert.match(helper,/type Shape = string/);assert.match(helper,/class Demo<T>/);assert.match(helper,/value = 10/);assert.match(helper,/run\(\)\{return 2;/);assert.match(helper,/f\(\)\{return 3;/);
  for(const label of ['声明 limit','类型 Shape','类 Demo','instance:field:value','entity.User: 类装饰器']) assert.ok(plan.manual.some(message=>message.includes(label)),label+'\n'+plan.manual.join('\n'));
  assert.match(content('src/entities/user.ts'),/value = 1;/);assert.match(content('src/entities/user.ts'),/localOnly = 20/);assert.match(content('src/entities/user.ts'),/@Table\("local"\)/);
  assert.doesNotMatch(content('src/ruleType/string.ts'),/legacy|local mobile/);
  assert.match(content('src/config/default.ts'),/port: 10/);assert.match(content('src/config/default.ts'),/added: true/);
  assert.match(content('pnpm-workspace.yaml'),/packages: \[\s*local\s*\]/);assert.match(content('pnpm-workspace.yaml'),/old: "10"/);assert.match(content('pnpm-workspace.yaml'),/added/);
  assert.deepEqual(JSON.parse(content('tsconfig.json')).compilerOptions,{strict:false,skipLibCheck:true});
  assert.equal(content('.env'),'VALUE=local\nADDED=yes\n');
  assert.match(content('view/index/src/router/routes.ts'),/value: "local"/);assert.match(content('view/index/src/router/routes.ts'),/path: "\/added"/);assert.match(content('view/index/src/router/routes.ts'),/return 10/);
  assert.match(content('src/filter/index.ts'),/export \{ local \}/);assert.match(content('src/filter/index.ts'),/export \{ target \}/);
  assert.deepEqual(plan.skipped,['protected.txt: 存在时跳过']);
  const protectedPlan=makePlan(f.root,f.base,f.target,'1.3.11',{...rules,...Object.fromEntries(cases.map(([path])=>[path,true]))});
  assert.equal(protectedPlan.changes.length,2);assert.equal(protectedPlan.skipped.length,cases.length+1);
  assert.ok(!protectedPlan.manual.some(message=>cases.some(([path])=>message.startsWith(path+':'))));
  applyPlan(f.root,plan,'1.3.11','1.3.11');
  for(const [path,text] of [['identical.txt','相同'],['only-local.txt','独有'],['removed.txt','保留'],['different/created.txt','同名不同路径保留'],['protected.txt','受保护'],['created.txt','创建'],['protected-new.txt','缺失仍创建']]) assert.equal(readFileSync(join(f.root,path),'utf8'),text);
  const repeated=makePlan(f.root,f.base,f.target,'1.3.11',rules);
  assert.equal(repeated.changes.length,0,repeated.manual.join('\n'));
  assert.ok(repeated.manual.some(message=>message.includes('声明 limit')));
  assert.ok(repeated.manual.some(message=>message.includes('entity.User: 类装饰器')));
 }
});

test('本地目标比较、缺失首页创建、本地独有保留、配置只增',()=>{
 const f=fixture();f.put('base','same.ts','old');f.put('target','same.ts','old');f.put('root','same.ts','custom');
 f.put('base','changed.ts','old');f.put('target','changed.ts','new');f.put('root','changed.ts','old');
 f.put('base','conflict.ts','old');f.put('target','conflict.ts','new');f.put('root','conflict.ts','custom');
 f.put('target','view/admin/src/views/index/index.vue','new homepage');f.put('root','mine.ts','mine');
 f.put('base','src/config/config.default.ts','export default { port: 1 };');f.put('root','src/config/config.default.ts','export default { port: 9 };');f.put('target','src/config/config.default.ts','export default { port: 2, added: true };');
 const plan=makePlan(f.root,f.base,f.target,'1.4.0',{});
 assert.equal(plan.changes.find(c=>c.path==='same.ts').content.toString(),'old');assert(plan.changes.find(c=>c.path==='conflict.ts').conflict);
 assert.equal(plan.changes.find(c=>c.path.endsWith('index.vue')).action,'create');
 const dir=applyPlan(f.root,plan,'1.3.6','1.4.0');assert.equal(readFileSync(join(f.root,'changed.ts'),'utf8'),'new');assert.match(readFileSync(join(f.root,'src/config/config.default.ts'),'utf8'),/port: 9/);assert.equal(readFileSync(join(f.root,'mine.ts'),'utf8'),'mine');
 rollback(f.root,dir);assert.equal(readFileSync(join(f.root,'changed.ts'),'utf8'),'old');assert(!existsSync(join(f.root,'view/admin/src/views/index/index.vue')));
});
test('预览后修改阻止写入，回滚不覆盖升级后修改',()=>{
 const f=fixture();f.put('base','a','old');f.put('target','a','new');f.put('root','a','old');const plan=makePlan(f.root,f.base,f.target,'1.4.0',{});
 f.put('root','a','new user');assert.throws(()=>applyPlan(f.root,plan,'1.3.6','1.4.0'));
 f.put('root','a','old');const dir=applyPlan(f.root,plan,'1.3.6','1.4.0');f.put('root','a','after');assert.throws(()=>rollback(f.root,dir));assert.equal(readFileSync(join(f.root,'a'),'utf8'),'after');
});
test('SQL改名与数据脚本生成不覆盖原始meadmin.sql，UPDATE 保留到 update.sql 且不计入插入统计',()=>{
 const f=fixture();
 const update='UPDATE ONLY app.missing AS target SET n = n + 1;';
 const source='CREATE TABLE t (id text PRIMARY KEY); INSERT INTO t(id) VALUES (\'a\');\n'+update;
 f.put('target','meadmin.sql',source);f.put('root','meadmin.sql','local');
 const plan=makePlan(f.root,f.base,f.target,'1.4.0',{});
 assert.equal(plan.changes.find(c=>c.path==='meadmin-1.4.0.sql').content.toString(),source);
 assert(!plan.changes.some(c=>c.path==='meadmin.sql'));
 const script=plan.changes.find(c=>c.path==='update.sql').content.toString();
 assert.match(script,/WHERE NOT EXISTS \(SELECT 1 FROM "t" AS existing WHERE existing\."id" IS NOT DISTINCT FROM 'a'\)/);
 assert.ok(script.includes('\n\n'+update+'\n\nCOMMIT;'));
 assert.deepEqual(plan.sqlTables,[{table:'t',rows:1,keys:['id']}]);
 assert.match(plan.manual.join('\n'),/SQL: 第 2 行：警告：UPDATE 无顶层 WHERE.*已原样保留/);
 applyPlan(f.root,plan,'1.3.6','1.4.0');
 assert.equal(readFileSync(join(f.root,'meadmin.sql'),'utf8'),'local');
 assert.equal(readFileSync(join(f.root,'meadmin-1.4.0.sql'),'utf8'),source);
 assert.equal(readFileSync(join(f.root,'update.sql'),'utf8'),script);
});
function archive(name,type='0') {const h=Buffer.alloc(512);h.write(name);h.write('00000000001\0',124);h.write(type,156);h.fill(32,148,156);const sum=h.reduce((a,b)=>a+b,0);h.write(sum.toString(8).padStart(6,'0')+'\0 ',148);return gzipSync(Buffer.concat([h,Buffer.from('x'),Buffer.alloc(511),Buffer.alloc(1024)]));}
test('压缩包拒绝越界路径及符号链接',()=>{const f=fixture();assert.throws(()=>unpackTemplate(archive('package/../../oops'),f.root));assert.throws(()=>unpackTemplate(archive('package/link','2'),f.root));unpackTemplate(archive('package/a'),f.root);assert.equal(readFileSync(join(f.root,'package/a'),'utf8'),'x');});
