import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { createHash, randomUUID } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { makePlan } from '../dist/update/planner.js';
import { applyPlan } from '../dist/update/backup.js';
test('同版本命令补齐真实bullmq与嵌套配置，创建缺失文件但不重复生成SQL，重复运行不再报告变更', async () => {
  const root = mkdtempSync(join(tmpdir(), 'meadmin-same-version-'));
  const template = mkdtempSync(join(tmpdir(), 'meadmin-same-template-'));
  const put = (directory, path, text) => {
    mkdirSync(join(directory, path, '..'), { recursive: true });
    writeFileSync(join(directory, path), text);
  };
  put(root, 'package.json', '{"name":"business","scripts":{"dev":"custom"},"dependencies":{"@meadmin/core":"1.3.9"}}');
  put(root, 'node_modules/@meadmin/core/package.json', '{"name":"@meadmin/core","version":"1.3.9","main":"index.js"}');
  put(root, 'node_modules/@meadmin/core/index.js', '');
  const executableConfig = 'require("node:fs").writeFileSync("CONFIG_EXECUTED", "bad"); module.exports = {};';
  put(root, '.prettierrc.cjs', executableConfig);
  const workspace = readFileSync(new URL('../../create-meadmin/template/meadmin/pnpm-workspace.yaml', import.meta.url), 'utf8');
  const files = {
    'packageTemplate.json': '{"dependencies":{"@meadmin/core":"1.3.9"},"pnpm":{"overrides":{"bullmq":"~5.81.3"}}}',
    'pnpm-workspace.yaml': workspace,
    'apps/api/pnpm-workspace.yaml': workspace,
    'view/admin/tsconfig.app.json': '{"compilerOptions":{"strict":true,"skipLibCheck":true}}',
    'test/tsconfig.json': '{"compilerOptions":{"strict":true}}',
    '.npmrc': 'auto-install-peers=false\n',
    'view/index/.prettierignore': 'dist/\n',
    'src/config/config.default.ts': 'export default {added:true}',
    'src/config/new.ts': 'export default {new:true}',
    'src/entities/user.ts': 'export class User { added = 1; }',
    'src/entities/new.ts': 'export class New {}',
    'business.ts': 'export const business = true;',
    '.env': 'SECRET=TEMPLATE_SECRET\nEMPTY=filled\nexport ADDED="first\n#inside=value\nlast"\n',
    'view/admin/.env.production': '# 新环境文件\r\nNEW=TARGET_SECRET',
    'view/index/.env.local': 'NEW=TARGET_SECRET\n',
    '.env.local': 'BAD="PRIVATE_VALUE\n',
    'meadmin.sql': "CREATE TABLE t(id text PRIMARY KEY); INSERT INTO t(id) VALUES ('x');",
  };
  for (const [path, content] of Object.entries(files)) put(template, path, content);
  put(root, 'pnpm-workspace.yaml', 'packages: ["local/*"]\n');
  put(root, 'apps/api/pnpm-workspace.yaml', 'overrides: { custom: "1" }\n');
  put(root, 'view/admin/tsconfig.app.json', '// 本地\n{"compilerOptions":{"strict":false}}');
  put(root, 'src/config/config.default.ts', 'export default {local:true}');
  put(root, 'src/entities/user.ts', 'export class User { local = 1; }');
  const localEnv = '# 本地\r\nSECRET=LOCAL_SECRET\r\nEMPTY=';
  put(root, '.env', localEnv);
  put(root, 'view/index/.env.local', 'LOCAL=LOCAL_SECRET\n');
  put(root, 'meadmin.update.json', JSON.stringify({ skipExisting: { 'view/index/.env.local': true } }));
  const archive = pack({ 'package.json': '{"name":"create-meadminjs","version":"1.3.9"}', ...Object.fromEntries(Object.entries(files).map(([path, content]) => ['template/meadmin/' + path, content])) });
  let origin;
  const server = createServer((req, res) => {
    if (req.url === '/create-meadminjs') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ versions: { '1.3.9': { dist: { tarball: origin + '/archive', integrity: 'sha512-' + createHash('sha512').update(archive).digest('base64') } } } }));
    } else res.end(archive);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  try {
    const result = await execute(root, ['--version', '1.3.9', '-m', 'unittest', '--dry-run', '--registry', origin]);
    assert.equal(result.code, 0, result.text);
    assert.match(result.text, /已安装目标版本 1.3.9/);
    const changes = result.text.split(/\r?\n/).filter(line => /^(create|merge|overwrite)( |:)/.test(line));
    for (const path of ['package.json', 'pnpm-workspace.yaml', 'apps/api/pnpm-workspace.yaml', 'view/admin/tsconfig.app.json', 'test/tsconfig.json', '.npmrc', 'view/index/.prettierignore', 'src/config/config.default.ts', 'src/entities/user.ts']) assert.ok(changes.some(line => line.endsWith(': ' + path)), path + '\n' + result.text);
    assert.equal(changes.length, 14, result.text);
    assert.ok(changes.some(line => /^merge.*: \.env$/.test(line)));
    assert.ok(changes.includes('create: view/admin/.env.production'));
    assert.match(result.text, /跳过: view\/index\/\.env.local: 存在时跳过/);
    assert.match(result.text, /人工处理: \.env.local:/);
    assert.doesNotMatch(result.text, /LOCAL_SECRET|TEMPLATE_SECRET|TARGET_SECRET|PRIVATE_VALUE|inside=value/);
    assert.equal(readFileSync(join(root, '.env'), 'utf8'), localEnv);
    assert.equal(existsSync(join(root, 'view/admin/.env.production')), false);
    assert.equal(existsSync(join(root, '.env.local')), false);
    for (const path of ['business.ts', 'src/config/new.ts', 'src/entities/new.ts']) assert.ok(changes.some(line => line === 'create: ' + path));
    assert.equal(readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8'), 'packages: ["local/*"]\n');
    assert.equal(existsSync(join(root, 'test/tsconfig.json')), false);
    assert.equal(existsSync(join(root, 'CONFIG_EXECUTED')), false, 'update 不应执行本地 Prettier 配置');
    assert.equal(readFileSync(join(root, '.prettierrc.cjs'), 'utf8'), executableConfig);
    // 实际应用独立规划结果后再通过命令验证重复运行，避免把 CLI 过滤条件复制进测试。
    applyPlan(root, makePlan(root, template, template, '1.3.9', { 'view/index/.env.local': true }), '1.3.9', '1.3.9');
    assert.equal(readFileSync(join(root, '.env'), 'utf8'), localEnv + '\r\nexport ADDED="first\r\n#inside=value\r\nlast"\r\n');
    assert.equal(readFileSync(join(root, 'view/admin/.env.production'), 'utf8'), files['view/admin/.env.production']);
    assert.equal(readFileSync(join(root, 'view/index/.env.local'), 'utf8'), 'LOCAL=LOCAL_SECRET\n');
    const repeated = await execute(root, ['--dry-run', '--registry', origin]);
    assert.equal(repeated.code, 0, repeated.text);
    assert.doesNotMatch(repeated.text, /^(create|merge|overwrite)( |:)/m);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

function pack(files) {const blocks=[];for(const [name,content] of Object.entries(files)){const body=Buffer.from(content);const h=Buffer.alloc(512);h.write('package/'+name);h.write(body.length.toString(8).padStart(11,'0')+'\0',124);h.write('0',156);h.fill(32,148,156);h.write(h.reduce((a,b)=>a+b,0).toString(8).padStart(6,'0')+'\0 ',148);blocks.push(h,body,Buffer.alloc((512-body.length%512)%512));}return gzipSync(Buffer.concat([...blocks,Buffer.alloc(1024)]));}
function execute(root,args){return new Promise(resolve=>{const p=spawn(process.execPath,[fileURLToPath(new URL('../dist/index.js',import.meta.url)),'update',...args],{cwd:root,stdio:['ignore','pipe','pipe']});let text='';p.stdout.on('data',b=>text+=b);p.stderr.on('data',b=>text+=b);p.on('exit',code=>resolve({code,text}));});}
test('历史查询不需要core或registry，空历史正常退出',async()=>{
 const root=mkdtempSync(join(tmpdir(),'meadmin-history-'));writeFileSync(join(root,'package.json'),'{}');
 const result=await execute(root,['--history']);assert.equal(result.code,0,result.text);assert.match(result.text,/暂无升级历史/);assert.equal(existsSync(join(root,'node_modules')),false);
});
test('命令级：本机registry下载校验，dry-run不写项目，非交互拒绝覆盖',async()=>{
 const root=mkdtempSync(join(tmpdir(),'meadmin-command-'));mkdirSync(join(root,'node_modules/@meadmin/core'),{recursive:true});
 writeFileSync(join(root,'package.json'),JSON.stringify({name:'business',dependencies:{'@meadmin/core':'1.0.0'}}));writeFileSync(join(root,'node_modules/@meadmin/core/package.json'),JSON.stringify({name:'@meadmin/core',version:'1.0.0',main:'index.js'}));writeFileSync(join(root,'node_modules/@meadmin/core/index.js'),'');writeFileSync(join(root,'app.ts'),'old');
 const archives=Object.fromEntries(['1.0.0','1.1.0'].map(v=>[v,pack({'package.json':JSON.stringify({name:'create-meadminjs',version:v}),'template/meadmin/packageTemplate.json':JSON.stringify({name:'meadmin',dependencies:{'@meadmin/core':v}}),'template/meadmin/app.ts':v==='1.0.0'?'old':'new','template/meadmin/meadmin.sql':"CREATE TABLE t(id text PRIMARY KEY); INSERT INTO t(id) VALUES ('x');"})]));
 let origin;const server=createServer((req,res)=>{if(req.url==='/create-meadminjs'){res.setHeader('content-type','application/json');res.end(JSON.stringify({versions:Object.fromEntries(Object.entries(archives).map(([v,body])=>[v,{dist:{tarball:origin+'/'+v,integrity:'sha512-'+createHash('sha512').update(body).digest('base64')}}]))}));}else{const buffer=archives[req.url.slice(1)];res.end(buffer);}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 try {let result=await execute(root,['--dry-run','--registry',origin]);assert.equal(result.code,0,result.text);assert.match(result.text,/1\.0\.0.*1\.1\.0/);assert.match(result.text,/SQL候选插入（仅统计 INSERT 源行，不含 UPDATE，不代表数据库实际新增）/);assert.equal(readFileSync(join(root,'app.ts'),'utf8'),'old');assert(!existsSync(join(root,'.meadmin')));assert(!existsSync(join(root,'node_modules/.meadmin')));assert(!existsSync(join(root,'update.sql')));
 result=await execute(root,['--registry',origin]);assert.equal(result.code,1);assert.match(result.text,/交互式终端/);assert.equal(readFileSync(join(root,'app.ts'),'utf8'),'old');
 const ids=[];
 for(let i=0;i<4;i++) {const id=`v1.0.0_to_v1.1.0_${randomUUID()}`;ids.push(id);const dir=join(root,'node_modules/.meadmin/updates',id);mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'record.json'),i===3?'broken json':JSON.stringify({from:'1.0.0',to:'1.1.0',phase:'failed',installation:'running'}));}
 result=await execute(root,['--history']);assert.equal(result.code,0,result.text);for(const id of ids)assert.ok(result.text.includes('--rollback '+id));assert.match(result.text,/记录缺失或损坏/);
 result=await execute(root,['--dry-run','--registry',origin]);assert.equal(result.code,0,result.text);assert.match(result.text,/备份过多/);assert.match(result.text,/手动/);assert.match(result.text,/1\.0\.0.*1\.1\.0/);for(const id of ids)assert.ok(existsSync(join(root,'node_modules/.meadmin/updates',id,'record.json')));
 } finally {await new Promise(resolve=>server.close(resolve));}
});
