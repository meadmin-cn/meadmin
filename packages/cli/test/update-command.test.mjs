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
  const validation = readFileSync(new URL('../../../src/ruleType/string.ts', import.meta.url), 'utf8');
  const localImage = Buffer.from([0xff, 0xd8, 0, 0x80, 0xfe]);
  const missingFiles = {
    'AI-README.md': readFileSync(new URL('../../create-meadmin/template/meadmin/AI-README.md', import.meta.url)),
    'docs/arbitrary.md': Buffer.from('\uFEFF# 任意文档\r\n保留末尾空格  '),
    'assets/data.bin': Buffer.from([0xff, 0, 0x80, 0xc3, 0x28]),
    '.hidden/data': Buffer.from([0x81, 0, 0xfe]),
    '.envrc': Buffer.from('source ./dynamic-env\r\n'),
    'nested/pnpm-workspace.yaml': Buffer.from('packages: [\r\n'),
    'nested/tsconfig.json': Buffer.from('{ "compilerOptions": '),
    'nested/vite.config.ts': Buffer.from('export default makeConfig();\r\n'),
  };
  const files = {
    ...missingFiles,
    'uploadFile/default.png': Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 0xff, 0x80]),
    'uploadFile/images/existing.png': Buffer.from([0x89, 0x50, 0, 0xc3, 0x28]),
    'ordinary.txt': '目标普通内容',
    'identical.txt': '相同内容',
    'view/admin/src/views/index/index.vue': '目标首页',
    'src/ruleType/string.ts': validation,
    'src/utils/manual.ts': 'export const limit = 1; export type Shape = number; export class Demo { value = 1; }',
    'view/index/src/router/routes.ts': 'export const routes = [{path: "/same", meta: {value: "target"}}, {path: "/added"}]; function helper(){return 1;}',
    'src/filter/index.ts': "export { target } from './target.js';",
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
    'view/admin/src/utils/helper.ts': 'export function same(){return 1;} export const added=()=>2;',
    'view/index/src/api/helper.ts': 'export class Api { run(){return 3;} }',
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
  put(root, 'ordinary.txt', '本地普通内容');
  put(root, 'identical.txt', files['identical.txt']);
  put(root, 'only-local.txt', '本地独有');
  put(root, 'uploadFile/images/existing.png', localImage);
  put(root, 'uploadFile/local-only.png', localImage);
  put(root, 'view/admin/src/views/index/index.vue', '本地首页');
  put(root, 'src/ruleType/string.ts', validation.replace('mobile(): this;', 'mobile(legacy?: boolean): this;').replace("'string.mobile': '{{#label}} must be a true mobile'", "'string.mobile': 'local mobile'"));
  const manualSource = 'export const limit = 10; export type Shape = string; export class Demo<T> { value = 10; }';
  put(root, 'src/utils/manual.ts', manualSource);
  put(root, 'view/index/src/router/routes.ts', 'export const routes = [{path: "/same", meta: {value: "local"}}]; function helper(){return 10;}');
  put(root, 'src/filter/index.ts', "export { local } from './local.js';");
  put(root, 'src/config/config.default.ts', 'export default {local:true}');
  put(root, 'src/entities/user.ts', 'export class User<T> { added = 10; local = 1; }');
  put(root, 'view/admin/src/utils/helper.ts', 'export function same(){return 10;} export const localOnly=()=>20;');
  put(root, 'view/index/src/api/helper.ts', 'export class Api { run(){return 30;} localOnly(){return 40;} }');
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
    assert.equal(changes.length, 22 + Object.keys(missingFiles).length, result.text);
    for (const path of Object.keys(missingFiles)) {
      assert.ok(changes.includes('create: ' + path), result.text);
      assert.equal(existsSync(join(root, path)), false);
      assert.ok(!result.text.includes('人工处理: ' + path + ':'), result.text);
    }
    assert.ok(changes.includes('create: uploadFile/default.png'), result.text);
    assert.match(result.text, /跳过: uploadFile\/images\/existing\.png: 存在时跳过/);
    assert.equal(existsSync(join(root, 'uploadFile/default.png')), false);
    assert.deepEqual(readFileSync(join(root, 'uploadFile/images/existing.png')), localImage);
    assert.deepEqual(readFileSync(join(root, 'uploadFile/local-only.png')), localImage);
    assert.ok(changes.some(line => /^overwrite.*: ordinary\.txt$/.test(line)));
    for (const path of ['src/ruleType/string.ts', 'view/index/src/router/routes.ts', 'src/filter/index.ts']) assert.ok(changes.some(line => /^merge/.test(line) && line.endsWith(': ' + path)), result.text);
    for (const label of ['声明 limit', '类型 Shape', '类 Demo', 'instance:field:value', 'entity.User: 类装饰器']) assert.ok(result.text.includes(label), label + '\n' + result.text);
    assert.match(result.text, /跳过: view\/admin\/src\/views\/index\/index.vue: 存在时跳过/);
    for (const path of ['identical.txt', 'only-local.txt', 'src/utils/manual.ts']) assert.ok(!changes.some(line => line.endsWith(': ' + path)), result.text);
    assert.equal(readFileSync(join(root, 'ordinary.txt'), 'utf8'), '本地普通内容');
    for (const path of ['view/admin/src/utils/helper.ts', 'view/index/src/api/helper.ts']) assert.ok(changes.some(line => /^merge/.test(line) && line.endsWith(': ' + path)), result.text);
    assert.match(readFileSync(join(root, 'view/admin/src/utils/helper.ts'), 'utf8'), /return 10/);
    assert.ok(changes.some(line => /^merge.*: \.env$/.test(line)));
    assert.ok(changes.includes('create: view/admin/.env.production'));
    assert.match(result.text, /跳过: view\/index\/\.env.local: 存在时跳过/);
    assert.ok(changes.includes('create: .env.local'));
    assert.doesNotMatch(result.text, /人工处理: \.env.local:/);
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
    for (const [path, content] of Object.entries(missingFiles)) assert.deepEqual(readFileSync(join(root, path)), content);
    assert.equal(readFileSync(join(root, '.env.local'), 'utf8'), files['.env.local']);
    assert.deepEqual(readFileSync(join(root, 'uploadFile/default.png')), files['uploadFile/default.png']);
    assert.deepEqual(readFileSync(join(root, 'uploadFile/images/existing.png')), localImage);
    assert.deepEqual(readFileSync(join(root, 'uploadFile/local-only.png')), localImage);
    assert.equal(readFileSync(join(root, '.env'), 'utf8'), localEnv + '\r\nexport ADDED="first\r\n#inside=value\r\nlast"');
    assert.equal(readFileSync(join(root, 'view/admin/.env.production'), 'utf8'), files['view/admin/.env.production']);
    const helper = readFileSync(join(root, 'view/admin/src/utils/helper.ts'), 'utf8');
    assert.match(helper, /same\(\)\{return 1;\}/);assert.match(helper, /added=\(\)=>2/);assert.match(helper, /localOnly=\(\)=>20/);
    const api = readFileSync(join(root, 'view/index/src/api/helper.ts'), 'utf8');
    assert.match(api, /run\(\)\{return 3;\}/);assert.match(api, /localOnly\(\)\{return 40;\}/);
    assert.equal(readFileSync(join(root, 'view/index/.env.local'), 'utf8'), 'LOCAL=LOCAL_SECRET\n');
    assert.equal(readFileSync(join(root, 'ordinary.txt'), 'utf8'), files['ordinary.txt']);
    assert.equal(readFileSync(join(root, 'identical.txt'), 'utf8'), files['identical.txt']);
    assert.equal(readFileSync(join(root, 'only-local.txt'), 'utf8'), '本地独有');
    assert.equal(readFileSync(join(root, 'view/admin/src/views/index/index.vue'), 'utf8'), '本地首页');
    assert.equal(readFileSync(join(root, 'src/utils/manual.ts'), 'utf8'), manualSource);
    const entity = readFileSync(join(root, 'src/entities/user.ts'), 'utf8');
    assert.match(entity, /class User<T>/);assert.match(entity, /added = 1;/);assert.match(entity, /local = 1;/);
    assert.doesNotMatch(readFileSync(join(root, 'src/ruleType/string.ts'), 'utf8'), /legacy|local mobile/);
    const routes = readFileSync(join(root, 'view/index/src/router/routes.ts'), 'utf8');
    assert.match(routes, /value: "local"/);assert.match(routes, /path: "\/added"/);assert.match(routes, /return 10/);
    const exports = readFileSync(join(root, 'src/filter/index.ts'), 'utf8');
    assert.match(exports, /export \{ local \}/);assert.match(exports, /export \{ target \}/);
    const repeated = await execute(root, ['--dry-run', '--registry', origin]);
    assert.equal(repeated.code, 0, repeated.text);
    assert.doesNotMatch(repeated.text, /^(create|merge|overwrite)( |:)/m);
    assert.match(repeated.text, /声明 limit/);
    assert.match(repeated.text, /entity.User: 类装饰器/);
    put(root, 'meadmin.update.json', JSON.stringify({ skipExisting: { 'view/index/.env.local': true, 'uploadFile/**': false } }));
    const override = await execute(root, ['--version', '1.3.9', '--dry-run', '--registry', origin]);
    assert.equal(override.code, 0, override.text);
    const overrideChanges = override.text.split(/\r?\n/).filter(line => /^(create|merge|overwrite)( |:)/.test(line));
    assert.deepEqual(overrideChanges, ['overwrite [本地冲突]: uploadFile/images/existing.png']);
    assert.deepEqual(readFileSync(join(root, 'uploadFile/images/existing.png')), localImage);
    assert.deepEqual(readFileSync(join(root, 'uploadFile/local-only.png')), localImage);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('真实命令完整配置：入口优先级、排除开放、组关闭、映射与 SQL 策略全部传入 planner', async () => {
  const root = mkdtempSync(join(tmpdir(), 'meadmin-config-command-'));
  const put = (path, text) => { mkdirSync(join(root, path, '..'), { recursive: true }); writeFileSync(join(root, path), text); };
  put('package.json', '{"name":"business"}');
  put('node_modules/@meadmin/core/package.json', '{"name":"@meadmin/core","version":"1.0.0","main":"index.js"}');
  put('node_modules/@meadmin/core/index.js', '');
  put('public/existing.txt', 'local'); put('src/config/default.ts', 'export default {local:true}');
  put('registry.ts', "export { mine } from './mine.js';");
  const files = {
    'packageTemplate.json': '{"name":"target"}', 'pnpm-lock.yaml': 'target lock',
    'node_modules/custom/keep.txt': 'keep', 'node_modules/custom/drop.txt': 'drop', 'dist/chunk.txt': 'chunk',
    'public/existing.txt': 'target', 'src/config/default.ts': 'export default {added:true}',
    'custom/environment.data': 'KEY=target\nADDED=yes\n', 'registry.ts': "export { added } from './added.js';",
    'missing.txt': 'skip missing', 'meadmin.sql': "CREATE TABLE t(id text PRIMARY KEY); INSERT INTO t(id) VALUES ('x');",
  };
  put('custom/environment.data', 'KEY=local\n');
  const archives = Object.fromEntries(['1.0.0', '1.1.0'].map(version => [version, pack({
    'package.json': JSON.stringify({ name: 'create-meadminjs', version }),
    ...Object.fromEntries(Object.entries(files).map(([path, content]) => ['template/meadmin/' + path, content])),
  })]));
  let origin;
  const server = createServer((req, res) => {
    if (req.url === '/create-meadminjs') res.end(JSON.stringify({ versions: Object.fromEntries(Object.entries(archives).map(([version, archive]) => [version, { dist: { tarball: origin + '/' + version, integrity: 'sha512-' + createHash('sha512').update(archive).digest('base64') } }])) }));
    else res.end(archives[req.url.slice(1)]);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  const run = (...args) => execute(root, ['--dry-run', '--registry', origin, ...args]);
  const changes = result => result.text.split(/\r?\n/).filter(line => /^(create|merge|overwrite)( |:)/.test(line));
  try {
    put('meadmin.update.json', JSON.stringify({ defaultPolicy: 'skip', mergeSource: false, autoIntegration: false, sql: false }));
    const legacy = await run(); assert.equal(legacy.code, 0, legacy.text); assert.deepEqual(changes(legacy), []);
    const config = {
      exclude: { '**/node_modules/**': true, 'node_modules/custom/keep.txt': false, 'PNPM-LOCK.YAML': false, '**/dist/**': false },
      skipExisting: false, autoIntegration: false,
      mergeSource: { 'src/config/default.ts': 'overwrite', 'custom/environment.data': 'env', 'missing.txt': 'skip' },
      templateMappings: { '**/packageTemplate.json': false }, sql: false,
    };
    put('update.json', JSON.stringify(config));
    const result = await run(); assert.equal(result.code, 0, result.text);
    const lines = changes(result);
    for (const path of ['node_modules/custom/keep.txt', 'pnpm-lock.yaml', 'dist/chunk.txt', 'packageTemplate.json', 'meadmin.sql']) assert.ok(lines.includes('create: ' + path), result.text);
    for (const path of ['public/existing.txt', 'src/config/default.ts', 'registry.ts']) assert.ok(lines.some(line => line.startsWith('overwrite') && line.endsWith(': ' + path)), result.text);
    assert.ok(lines.some(line => line.startsWith('merge') && line.endsWith(': custom/environment.data')), result.text);
    for (const path of ['node_modules/custom/drop.txt', 'missing.txt', 'package.json', 'update.sql', 'meadmin-1.1.0.sql']) assert.ok(!lines.some(line => line.endsWith(': ' + path)), result.text);
    assert.equal(lines.length, 9, result.text);
    assert.equal(existsSync(join(root, 'dist')), false);
    assert.equal(readFileSync(join(root, 'custom/environment.data'), 'utf8'), 'KEY=local\n');
    assert.equal(existsSync(join(root, 'node_modules/.meadmin')), false);
    put('explicit.json', JSON.stringify({ exclude: false, skipExisting: false, mergeSource: false, autoIntegration: false, templateMappings: false, sql: false }));
    const explicit = await run('--config', 'explicit.json'); assert.equal(explicit.code, 0, explicit.text);
    assert.equal(changes(explicit).length, 11, explicit.text);
    assert.ok(changes(explicit).includes('create: node_modules/custom/drop.txt'));
    assert.ok(changes(explicit).includes('create: missing.txt'));
    put('update.json', '{broken');
    const broken = await run(); assert.equal(broken.code, 1, broken.text); assert.deepEqual(changes(broken), []);
    assert.equal((await run('--config', 'explicit.json')).code, 0);
    put('update.json', JSON.stringify({ mergeSource: { 'update.sql': 'skip', 'meadmin-1.1.0.sql': 'skip' } }));
    const sqlSkipped = await run(); assert.equal(sqlSkipped.code, 0, sqlSkipped.text);
    assert.match(sqlSkipped.text, /跳过: update.sql: 完全跳过/);
    assert.match(sqlSkipped.text, /跳过: meadmin-1.1.0.sql: 完全跳过/);
    assert.ok(!changes(sqlSkipped).some(line => /: (update.sql|meadmin-1.1.0.sql)$/.test(line)));
    put('update.json', JSON.stringify({ sql: { output: 'migrations/generated.sql', originalName: 'snapshots/{version}.sql' } }));
    const customSql = await run(); assert.equal(customSql.code, 0, customSql.text);
    assert.ok(changes(customSql).includes('create: migrations/generated.sql'));
    assert.ok(changes(customSql).includes('create: snapshots/1.1.0.sql'));
    const sameVersion = await run('--version', '1.0.0'); assert.equal(sameVersion.code, 0, sameVersion.text);
    assert.ok(!changes(sameVersion).some(line => /migrations\/generated.sql|snapshots\/1.0.0.sql/.test(line)));
    for (const generateOnSameVersion of [true, false]) {
      put('update.json', JSON.stringify({ sql: { generateOnSameVersion, output: 'migrations/generated.sql', originalName: 'snapshots/{version}.sql' } }));
      const configured = await run('--version', '1.0.0'); assert.equal(configured.code, 0, configured.text);
      for (const path of ['migrations/generated.sql', 'snapshots/1.0.0.sql']) {
        assert.equal(changes(configured).includes('create: ' + path), generateOnSameVersion, configured.text);
        assert.equal(existsSync(join(root, path)), false, 'dry-run 不写入 SQL 产物');
      }
      assert.equal(/table: 't'/.test(configured.text), generateOnSameVersion, configured.text);
    }
    put('update.json', JSON.stringify({ sql: { generateOnSameVersion: true }, mergeSource: { 'update.sql': 'skip', 'meadmin-1.0.0.sql': 'skip' } }));
    const sameSkipped = await run('--version', '1.0.0'); assert.equal(sameSkipped.code, 0, sameSkipped.text);
    assert.match(sameSkipped.text, /跳过: update.sql: 完全跳过/);
    assert.ok(!changes(sameSkipped).some(line => /: (update.sql|meadmin-1.0.0.sql)$/.test(line)));
    put('update.json', JSON.stringify({ sql: { enabled: false, generateOnSameVersion: true } }));
    const disabledSql = await run('--version', '1.0.0'); assert.equal(disabledSql.code, 0, disabledSql.text);
    assert.ok(changes(disabledSql).includes('create: meadmin.sql'));
    assert.ok(!changes(disabledSql).some(line => /: (update.sql|meadmin-1.0.0.sql)$/.test(line)));
  } finally { await new Promise(resolve => server.close(resolve)); }
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
