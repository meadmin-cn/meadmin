import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { makePlan } from '../dist/update/planner.js';
import { applyPlan, rollback } from '../dist/update/backup.js';
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
 assert(!plan.changes.some(c=>c.path==='same.ts'));assert(plan.changes.find(c=>c.path==='conflict.ts').conflict);
 assert.equal(plan.changes.find(c=>c.path.endsWith('index.vue')).action,'create');
 const dir=applyPlan(f.root,plan,'1.3.6','1.4.0');assert.equal(readFileSync(join(f.root,'changed.ts'),'utf8'),'new');assert.match(readFileSync(join(f.root,'src/config/config.default.ts'),'utf8'),/port: 9/);assert.equal(readFileSync(join(f.root,'mine.ts'),'utf8'),'mine');
 rollback(f.root,dir);assert.equal(readFileSync(join(f.root,'changed.ts'),'utf8'),'old');assert(!existsSync(join(f.root,'view/admin/src/views/index/index.vue')));
});
test('预览后修改阻止写入，回滚不覆盖升级后修改',()=>{
 const f=fixture();f.put('base','a','old');f.put('target','a','new');f.put('root','a','old');const plan=makePlan(f.root,f.base,f.target,'1.4.0',{});
 f.put('root','a','new user');assert.throws(()=>applyPlan(f.root,plan,'1.3.6','1.4.0'));
 f.put('root','a','old');const dir=applyPlan(f.root,plan,'1.3.6','1.4.0');f.put('root','a','after');assert.throws(()=>rollback(f.root,dir));assert.equal(readFileSync(join(f.root,'a'),'utf8'),'after');
});
test('SQL改名与数据脚本生成不覆盖原始meadmin.sql',()=>{
 const f=fixture();f.put('target','meadmin.sql','CREATE TABLE t (id text PRIMARY KEY); INSERT INTO t(id) VALUES (\'a\');');f.put('root','meadmin.sql','local');
 const plan=makePlan(f.root,f.base,f.target,'1.4.0',{});assert(plan.changes.some(c=>c.path==='meadmin-1.4.0.sql'));assert(!plan.changes.some(c=>c.path==='meadmin.sql'));assert.match(plan.changes.find(c=>c.path==='update.sql').content.toString(),/ON CONFLICT/);
});
function archive(name,type='0') {const h=Buffer.alloc(512);h.write(name);h.write('00000000001\0',124);h.write(type,156);h.fill(32,148,156);const sum=h.reduce((a,b)=>a+b,0);h.write(sum.toString(8).padStart(6,'0')+'\0 ',148);return gzipSync(Buffer.concat([h,Buffer.from('x'),Buffer.alloc(511),Buffer.alloc(1024)]));}
test('压缩包拒绝越界路径及符号链接',()=>{const f=fixture();assert.throws(()=>unpackTemplate(archive('package/../../oops'),f.root));assert.throws(()=>unpackTemplate(archive('package/link','2'),f.root));unpackTemplate(archive('package/a'),f.root);assert.equal(readFileSync(join(f.root,'package/a'),'utf8'),'x');});
