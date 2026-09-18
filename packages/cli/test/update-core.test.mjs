import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makePlan } from '../dist/update/planner.js';
import { applyPlan, rollback, validBackupId } from '../dist/update/backup.js';
import { skipExisting, validateRules, validateConfig, sourceMode, excluded } from '../dist/update/rules.js';
import { currentVersion, selectVersion, unpackTemplate } from '../dist/update/template.js';
import { gzipSync } from 'node:zlib';
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
test('跳过存在文件规则和false精确覆盖、永久排除',()=>{
 assert.equal(skipExisting('view/admin/src/views/index/index.vue'),true);
 assert.equal(skipExisting('view/admin/src/views/index/index.vue',{'view/admin/src/views/index/index.vue':false}),false);
 assert.equal(excluded('.workbuddy/memory/a.md'),true);
 assert.equal(excluded('.GIT/config'),true);
 assert.equal(skipExisting('view/admin/src/views/index/components/a.vue',{'view/admin/src/views/index/components/**':false}),false);
 assert.throws(()=>skipExisting('view/admin/src/views/index/index.vue',{'view/admin/src/views/*/index.vue':false}));
 assert.throws(()=>validateRules({skipExisting:{'../x':false}}));
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
test('三方比较、缺失首页创建、本地独有保留、配置只增',()=>{
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
