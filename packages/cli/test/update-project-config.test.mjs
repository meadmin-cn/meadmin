import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse as parseEnv } from 'dotenv';
import { parse } from 'yaml';
import { parse as parseJsonc } from 'jsonc-parser';
import { isRepairableConfig, mergeProjectConfig, projectConfigKind } from '../dist/update/project-config.js';
import { mergePackage } from '../dist/update/merge.js';
import { makePlan } from '../dist/update/planner.js';
import { applyPlan, rollback } from '../dist/update/backup.js';

const templateRoot = new URL('../../create-meadmin/template/meadmin/', import.meta.url);
const workspace = readFileSync(new URL('pnpm-workspace.yaml', templateRoot), 'utf8');

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'meadmin-project-config-'));
  const paths = { root: join(dir, 'project'), base: join(dir, 'base'), target: join(dir, 'target') };
  for (const path of Object.values(paths)) mkdirSync(path);
  const put = (where, path, text) => {
    mkdirSync(join(paths[where], path, '..'), { recursive: true });
    writeFileSync(join(paths[where], path), text);
  };
  return { ...paths, put };
}

function jsonc(text) {
  const errors = [];
  const value = parseJsonc(text, errors, { allowTrailingComma: true });
  assert.deepEqual(errors, []);
  return value;
}

test('真实模板 YAML: 补齐 bullmq ~5.81.3，保留本地注释、配置值及 packages 数组', () => {
  assert.equal(parse(workspace).overrides.bullmq, '~5.81.3');
  const local = '# 本地工作区\r\nautoInstallPeers: true # 保留开关\r\npackages:\r\n  - "custom/*" # 保留包路径\r\n';
  const result = mergeProjectConfig('pnpm-workspace.yaml', local, workspace);
  const data = parse(result.content);
  assert.equal(data.overrides.bullmq, '~5.81.3');
  assert.equal(data.autoInstallPeers, true);
  assert.equal(data.dedupePeerDependents, true);
  assert.deepEqual(data.packages, ['custom/*']);
  for (const comment of ['# 本地工作区', '# 保留开关', '# 保留包路径']) assert.ok(result.content.includes(comment));
  assert.equal(result.content.replaceAll('\r\n', '').includes('\n'), false);
  assert.deepEqual(result.manual, []);
  assert.equal(mergeProjectConfig('pnpm-workspace.yaml', result.content, workspace).content, result.content);
});

test('YAML: 已有 overrides 保留并追加，已有 bullmq 自定义版本不覆盖', () => {
  for (const overrides of [{ lodash: '4.17.21' }, { bullmq: '~5.70.0', lodash: '4.17.21' }]) {
    const local = JSON.stringify({ packages: [], overrides });
    const result = mergeProjectConfig('apps/api/pnpm-workspace.yml', local, workspace);
    assert.deepEqual(parse(result.content).overrides, { ...overrides, bullmq: overrides.bullmq ?? '~5.81.3' });
    assert.deepEqual(parse(result.content).packages, []);
    assert.equal(mergeProjectConfig('apps/api/pnpm-workspace.yml', result.content, workspace).content, result.content);
  }
});

test('YAML: 递归只增，数组不追加、不合并数组内对象，null 不覆盖', () => {
  const local = 'nested:\n  list: [{ local: true }]\n  value: local\n  empty: null\n';
  const target = 'nested:\n  list: [{ added: true }]\n  value: target\n  empty: { added: true }\n  added: { enabled: true }\n';
  const result = mergeProjectConfig('pnpm-workspace.yaml', local, target);
  assert.deepEqual(parse(result.content), { nested: { list: [{ local: true }], value: 'local', empty: null, added: { enabled: true } } });
  assert.match(result.manual.join(), /nested.empty/);
});

test('YAML: anchors、aliases、merge key、多文档、标签、复杂键和原型键均转人工', () => {
  const samples = [
    'shared: &shared { value: 1 }\noverrides: *shared\n',
    'overrides: *missing\n',
    'overrides: { <<: { a: 1 } }\n',
    'x: 1\n---\nx: 2\n',
    'x: !custom value\n',
    '%YAML 1.1\n---\nx: yes\n',
    '? [a, b]\n: value\n',
    'x: 1\nx: 2\n',
    'overrides: {__proto__: {polluted: true}}\n',
    'x: {constructor: {prototype: {polluted: true}}}\n',
    'x: [ {prototype: {polluted: true}} ]\n',
    'x: [\n',
    '- a\n',
  ];
  for (const sample of samples) for (const [local, target] of [[sample, workspace], ['# 本地\ncustom: true\n', sample]]) {
    const result = mergeProjectConfig('pnpm-workspace.yaml', local, target);
    assert.equal(result.content, local, sample);
    assert.ok(result.manual.length, sample);
  }
  assert.equal({}.polluted, undefined);
});

test('JSONC: 真实前后台 tsconfig 支持注释，保留本地数组和值，重复运行幂等', () => {
  for (const path of ['tsconfig.json', 'test/tsconfig.json', 'view/admin/tsconfig.app.json', 'view/index/tsconfig.app.json', 'view/admin/tsconfig.node.json', 'view/index/tsconfig.json']) {
    const target = readFileSync(new URL(path, templateRoot), 'utf8');
    const local = '{\r\n  // 本地配置\r\n  "compilerOptions": { "strict": false, "paths": { "@/*": ["./custom/*"] }, "types": ["local"] /* 保留注释 */ },\r\n  "include": ["custom/**/*"],\r\n  "references": [{ "path": "./custom.json" }],\r\n}\r\n';
    const result = mergeProjectConfig(path, local, target);
    const data = jsonc(result.content);
    assert.equal(data.compilerOptions.strict, false);
    assert.deepEqual(data.compilerOptions.paths['@/*'], ['./custom/*']);
    assert.deepEqual(data.compilerOptions.types, ['local']);
    assert.deepEqual(data.include, ['custom/**/*']);
    assert.deepEqual(data.references, [{ path: './custom.json' }]);
    assert.match(result.content, /\/\/ 本地配置/);
    assert.match(result.content, /\/\* 保留注释 \*\//);
    assert.equal(result.content.replaceAll('\r\n', '').includes('\n'), false);
    assert.deepEqual(result.manual, []);
    assert.equal(mergeProjectConfig(path, result.content, target).content, result.content);
  }
});

test('JSONC: 无效语法、重复及深层原型键不写入，已有结构冲突转人工', () => {
  for (const invalid of ['{', '[]', '{"x":1,"x":2}', '{"list":[{"__proto__":{}}]}', '{"constructor":{"prototype":{}}}', '{x: call()}']) {
    for (const [local, target] of [[invalid, '{"safe":true}'], ['{}', invalid]]) {
      const result = mergeProjectConfig('tsconfig.json', local, target);
      assert.equal(result.content, local);
      assert.ok(result.manual.length);
    }
  }
  const result = mergeProjectConfig('tsconfig.json', '{"compilerOptions":null}', '{"compilerOptions":{"strict":true},"compileOnSave":true}');
  assert.deepEqual(jsonc(result.content), { compilerOptions: null, compileOnSave: true });
  assert.match(result.manual.join(), /compilerOptions/);
  assert.equal({}.polluted, undefined);
});

test('package: pnpm/overrides 等工程字段只增，保持 scripts 和元数据', () => {
  const local = JSON.stringify({ name: 'business', version: '9.0.0', scripts: { dev: 'custom' }, pnpm: { overrides: { custom: '1.0.0', bullmq: '~5.70.0' }, onlyBuiltDependencies: ['local'] }, engines: { node: '>=24' }, workspaces: ['local/*'] });
  const target = JSON.stringify({ name: 'template', version: '1.0.0', scripts: { build: 'target' }, pnpm: { overrides: { bullmq: '~5.81.3', extra: '2.0.0' }, onlyBuiltDependencies: ['target'], peerDependencyRules: { ignoreMissing: ['target'] } }, overrides: { bullmq: '~5.81.3' }, resolutions: { custom: '2' }, engines: { node: '>=22', pnpm: '>=10' }, packageManager: 'pnpm@10.0.0', workspaces: ['target/*'] });
  const result = mergePackage(local, target, target);
  const data = JSON.parse(result.content);
  assert.deepEqual(data.scripts, { dev: 'custom' });
  assert.equal(data.name, 'business');
  assert.equal(data.version, '9.0.0');
  assert.deepEqual(data.pnpm.overrides, { custom: '1.0.0', bullmq: '~5.70.0', extra: '2.0.0' });
  assert.deepEqual(data.pnpm.onlyBuiltDependencies, ['local']);
  assert.deepEqual(data.pnpm.peerDependencyRules.ignoreMissing, ['target']);
  assert.deepEqual(data.engines, { node: '>=24', pnpm: '>=10' });
  assert.deepEqual(data.workspaces, ['local/*']);
  assert.equal(data.packageManager, 'pnpm@10.0.0');
  assert.equal(data.overrides.bullmq, '~5.81.3');
  assert.equal(mergePackage(result.content, target, target).content, result.content);
  const missing = mergePackage('{"pnpm":{"overrides":{"custom":"1"}}}', '{"pnpm":{"overrides":{"bullmq":"~5.81.3"}}}');
  assert.equal(JSON.parse(missing.content).pnpm.overrides.bullmq, '~5.81.3');
  const unsafe = mergePackage('{}', '{"pnpm":{"overrides":{"__proto__":{"polluted":true}}}}');
  assert.equal(unsafe.content, '{}');
  assert.ok(unsafe.manual.length);
});

test('npmrc: 按键追加，保留认证、registry、注释和本地数组，不泄漏值', () => {
  const local = '# 本地设置\r\nregistry=https://local.invalid/\r\n//local.invalid/:_authToken=LOCAL_SECRET\r\npublic-hoist-pattern[]=local-a\r\npublic-hoist-pattern[]=local-b';
  const target = 'registry=https://target.invalid/\n//other.invalid/:_authToken=TEMPLATE_SECRET\npublic-hoist-pattern[]=target\nauto-install-peers=false # 模板注释\nnode-linker=hoisted\n';
  const result = mergeProjectConfig('apps/api/.npmrc', local, target);
  assert.ok(result.content.startsWith(local + '\r\n'));
  assert.match(result.content, /auto-install-peers=false # 模板注释/);
  assert.match(result.content, /node-linker=hoisted/);
  assert.doesNotMatch(result.content, /TEMPLATE_SECRET|public-hoist-pattern\[\]=target/);
  assert.doesNotMatch(result.manual.join(), /LOCAL_SECRET|TEMPLATE_SECRET/);
  assert.equal(mergeProjectConfig('.npmrc', result.content, target).content, result.content);
  assert.equal(mergeProjectConfig('.npmrc', '', 'items[]=a\nitems[]=b\n').content, 'items[]=a\nitems[]=b\n');
  assert.equal(mergeProjectConfig('.npmrc', 'items=local\n', 'items[]=target\n').content, 'items=local\n');
  for (const text of ['[section]\nkey=value', '__proto__=bad', 'unsupported']) {
    const failed = mergeProjectConfig('.npmrc', text, 'key=value');
    assert.equal(failed.content, text);
    assert.ok(failed.manual.length);
  }
});

test('静态配置及忽略文件只增；动态配置、编辑器分节配置保持原文', () => {
  for (const name of ['.prettierrc.js', 'apps/api/vite.config.ts', 'eslint.config.mjs']) {
    const local = '// 本地\nexport default { nested: { custom: true }, plugins: ["local"] };';
    const result = mergeProjectConfig(name, local, 'export default { nested: { added: true }, plugins: ["target"], enabled: true };');
    assert.match(result.content, /custom: true/);
    assert.match(result.content, /added: true/);
    assert.match(result.content, /plugins: \["local"\]/);
    assert.equal(mergeProjectConfig(name, result.content, 'export default { enabled: true };').content, result.content);
  }
  for (const name of ['.gitignore', '.npmignore', '.prettierignore']) {
    const result = mergeProjectConfig(name, '# 本地\nlocal/\n!keep\n', 'dist/\nlocal/\ndist/\n');
    assert.equal(result.content, '# 本地\nlocal/\n!keep\ndist/\n');
    assert.equal(mergeProjectConfig(name, result.content, 'dist/\nlocal/\n').content, result.content);
  }
  globalThis.__configExecuted = false;
  const result = mergeProjectConfig('vite.config.ts', 'export default {}', 'export default (() => { globalThis.__configExecuted = true; return { added: true }; })()');
  assert.equal(result.content, 'export default {}');
  assert.ok(result.manual.length);
  assert.equal(globalThis.__configExecuted, false);
  delete globalThis.__configExecuted;
  const editor = mergeProjectConfig('.editorconfig', '[*]\nindent_size=4\n', '[*]\nindent_size=2\ncharset=utf-8\n');
  assert.equal(editor.content, '[*]\nindent_size=4\n');
  assert.ok(editor.manual.length);
});

test('planner: 旧=目标仍补齐根目录与嵌套配置，应用后幂等且支持回滚', () => {
  const f = fixture();
  const files = {
    'pnpm-workspace.yaml': ['packages: ["local/*"]\n', workspace],
    'apps/api/pnpm-workspace.yml': ['overrides: { custom: "1" }\n', workspace],
    'apps/api/package.json': ['{"scripts":{"dev":"custom"}}', '{"pnpm":{"overrides":{"bullmq":"~5.81.3"}}}'],
    'view/admin/tsconfig.app.json': ['// 本地\n{"compilerOptions":{"strict":false}}', '{"compilerOptions":{"strict":true,"skipLibCheck":true}}'],
    'view/index/tsconfig.node.json': ['{}', '{"compilerOptions":{"strict":true}}'],
    'test/tsconfig.json': ['{}', '{"compilerOptions":{"strict":true}}'],
    '.vscode/settings.json': ['// 本地\n{}', '{"editor.formatOnSave":true}'],
    '.mocharc.json': ['{"spec":["custom"]}', '{"spec":["target"],"import":"tsx"}'],
    'nx.json': ['{}', '{"targetDefaults":{"build":{"cache":true}}}'],
    '.npmrc': ['registry=https://local.invalid/\n', 'auto-install-peers=false\n'],
    'view/admin/.prettierrc.js': ['export default {semi:false}', 'export default {semi:true,singleQuote:true}'],
    'view/index/.npmignore': ['custom/\n', 'dist/\n'],
    'src/config/config.default.ts': ['export default {local:1}', 'export default {added:true}'],
  };
  for (const [path, [local, target]] of Object.entries(files)) {
    f.put('root', path, local); f.put('base', path, target); f.put('target', path, target);
  }
  const plan = makePlan(f.root, f.base, f.target, '1.3.9', {});
  assert.deepEqual(new Set(plan.changes.map(change => change.path)), new Set(Object.keys(files)));
  assert.ok(plan.changes.every(change => change.action === 'merge'));
  const backup = applyPlan(f.root, plan, '1.3.9', '1.3.9');
  assert.equal(parse(readFileSync(join(f.root, 'pnpm-workspace.yaml'), 'utf8')).overrides.bullmq, '~5.81.3');
  assert.deepEqual(makePlan(f.root, f.base, f.target, '1.3.9', {}).changes, []);
  rollback(f.root, backup);
  for (const [path, [local]] of Object.entries(files)) assert.equal(readFileSync(join(f.root, path), 'utf8'), local);
});

test('planner: bullmq 同版本修复走局部 AST 合并，保留本地且再次规划幂等', () => {
  const f = fixture();
  const bullmq = `bullmq: {
    defaultConnection: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, password: process.env.REDIS_PASS, db: process.env.REDIS_MQ ?? 1 },
    defaultPrefix: '[meadmin-bullmq]', clearRepeatJobWhenStart: false
  }`;
  const target = `export default { ${bullmq}, list: ['target'], unknown: process.env.REDIS_MQ ?? missing };`;
  const locals = {
    'src/config/config.default.ts': "// 合成配置\nexport default { local: 'fixture', list: ['local'] };",
    'apps/api/src/config/config.default.ts': "export default { bullmq: { defaultConnection: { host: 'fixture-host', db: 9 }, defaultPrefix: 'local-prefix' }, list: ['local'] };",
    'tools/tool.config.ts': "export default { list: ['local'] };",
  };
  for (const [path, local] of Object.entries(locals)) {
    f.put('root', path, local); f.put('base', path, target); f.put('target', path, target);
    assert.equal(isRepairableConfig(path), true);
  }
  assert.equal(projectConfigKind('src/config/config.default.ts'), undefined);
  assert.equal(projectConfigKind('tools/tool.config.ts'), 'script');
  const plan = makePlan(f.root, f.target, f.target, '1.3.9', {}, { 'src/config/config.default.ts': 'overwrite' });
  assert.equal(plan.changes.length, 3);
  assert.deepEqual(plan.skipped, []);
  for (const change of plan.changes) {
    assert.equal(change.action, 'merge');
    assert.equal(change.conflict, true);
    const content = change.content.toString();
    assert.match(content, /list: \['local'\]/);
    assert.doesNotMatch(content, /unknown:|missing/);
    assert.match(content, /password: process.env.REDIS_PASS/);
    assert.ok(plan.manual.some(message => message.startsWith(`${change.path}: config.unknown:`)));
    assert.ok(!plan.manual.some(message => message.startsWith(`${change.path}: config.bullmq`)));
    if (change.path.startsWith('apps/')) {
      assert.match(content, /host: 'fixture-host', db: 9/);
      assert.match(content, /defaultPrefix: 'local-prefix'/);
    } else assert.ok(content.includes(bullmq));
    assert.equal(readFileSync(join(f.root, change.path), 'utf8'), locals[change.path]);
    f.put('root', change.path, content);
  }
  const repeat = makePlan(f.root, f.target, f.target, '1.3.9', {});
  assert.deepEqual(repeat.changes, []);
  assert.deepEqual(repeat.manual, plan.manual);
});

test('planner: bullmq 环境依赖被遮蔽或未知导出时保持原文并转人工', () => {
  const f = fixture();
  const path = 'src/config/config.default.ts';
  const target = 'export default { bullmq: { db: process.env.REDIS_MQ ?? 1 } };';
  f.put('target', path, target);
  for (const local of ['const process = {}; export default {};', 'export default defineConfig({});']) {
    f.put('root', path, local);
    const plan = makePlan(f.root, f.base, f.target, '1.3.9', {});
    assert.deepEqual(plan.changes, []);
    assert.ok(plan.manual.some(message => message.startsWith(path + ': config')));
    assert.equal(readFileSync(join(f.root, path), 'utf8'), local);
  }
});

test('planner: 缺失工程配置与 env 安全创建，已有 env 本地值保留，envrc 转人工', () => {
  const f = fixture();
  f.put('target', 'pnpm-workspace.yaml', workspace);
  f.put('target', 'view/admin/tsconfig.json', '{"compilerOptions":{"strict":true}}');
  f.put('target', '.npmrc', '//registry.invalid/:_authToken=TEMPLATE_SECRET\nregistry=https://registry.invalid/\nauto-install-peers=false\n');
  for (const path of ['.env', '.env.local', '.envrc', 'nested/apps/api/.env.production']) f.put('target', path, 'SECRET=template');
  f.put('root', '.env.local', 'SECRET=local');
  f.put('target', 'nested/pnpm-workspace.yaml', 'x: &x {a: 1}\ny: *x');
  f.put('target', 'nested/vite.config.ts', 'export default () => ({ port: 3000 })');
  const plan = makePlan(f.root, f.base, f.target, '1.3.9', { '.env.local': false });
  assert.deepEqual(new Set(plan.changes.map(change => change.path)), new Set(['pnpm-workspace.yaml', 'view/admin/tsconfig.json', '.npmrc', '.env', 'nested/apps/api/.env.production']));
  assert.ok(plan.changes.every(change => change.action === 'create'));
  assert.equal(plan.changes.find(change => change.path === '.npmrc').content.toString(), 'auto-install-peers=false\n');
  assert.deepEqual(plan.skipped, []);
  assert.ok(plan.manual.some(message => message.startsWith('.envrc:')));
  assert.equal(plan.changes.find(change => change.path === '.env').content.toString(), 'SECRET=template');
  assert.doesNotMatch(plan.manual.join(), /SECRET=|template/);
  assert.ok(plan.manual.some(message => message.includes('nested/pnpm-workspace.yaml')));
  assert.ok(plan.manual.some(message => message.includes('nested/vite.config.ts')));
});

test('planner: 工程配置 skipExisting 优先，动态配置不进入源码或整文件覆盖', () => {
  const f = fixture();
  f.put('root', 'pnpm-workspace.yaml', 'custom: true'); f.put('target', 'pnpm-workspace.yaml', workspace);
  for (const path of ['view/admin/vite.config.ts', 'view/index/eslint.config.js', '.prettierrc.js', '.editorconfig']) {
    const target = readFileSync(new URL(path, templateRoot), 'utf8');
    f.put('base', path, target); f.put('target', path, target); f.put('root', path, '// local\nexport default {}');
  }
  const plan = makePlan(f.root, f.base, f.target, '1.3.9', { 'pnpm-workspace.yaml': true }, { 'view/admin/vite.config.ts': 'functions' });
  assert.deepEqual(plan.changes, []);
  assert.ok(plan.skipped.some(message => message.startsWith('pnpm-workspace.yaml:')));
  for (const path of ['view/admin/vite.config.ts', 'view/index/eslint.config.js', '.prettierrc.js', '.editorconfig']) assert.ok(plan.manual.some(message => message.startsWith(path + ':')));
});

test('env: 本地原文、注释、空值及 BOM 保留，只追加目标缺失条目，不扩展变量', () => {
  const local = '\uFEFF# 本地注释\r\nexport KEEP = "LOCAL_SECRET" # 保留\r\nEMPTY=\r\nLOCAL_ONLY=yes';
  const target = '# 不复制目标独立注释\nKEEP=TARGET_SECRET\nEMPTY=filled\nexport NEW = \'#x=y\' # 条目注释\nRAW=${KEEP}\nCOMMAND=$(touch ENV_EXECUTED)\nNEW_EMPTY=\n';
  const environment = { ...process.env };
  const result = mergeProjectConfig('.env', local, target);
  assert.equal(result.content, local + '\r\nexport NEW = \'#x=y\' # 条目注释\r\nRAW=${KEEP}\r\nCOMMAND=$(touch ENV_EXECUTED)\r\nNEW_EMPTY=\r\n');
  assert.deepEqual(result.manual, []);
  assert.equal(JSON.stringify(process.env) === JSON.stringify(environment), true, '合并不得修改进程环境');
  assert.equal(parseEnv(result.content).EMPTY, '');
  assert.equal(parseEnv(result.content).RAW, '${KEEP}');
  assert.equal(mergeProjectConfig('.env', result.content, target).content, result.content);
  assert.equal(mergeProjectConfig('.env', local, 'KEEP=changed\nEMPTY=changed').content, local);
});

test('env: 单双引号多行中的伪 key、#、等号及转义引号按完整条目处理', () => {
  const local = '# 本地\r\nEXISTING="first\r\nFAKE=local\r\n#still=value\r\n"';
  const target = String.raw`EXISTING=target
export MULTI="first 'single' #=\"quoted\"
FAKE=inside
#inside=value
last"
SINGLE='first "double" #=\'quoted\'
INNER=value
last'
FAKE=outside
INNER=outside
ESCAPED="one\ntwo\rthree"
`;
  const result = mergeProjectConfig('view/admin/.env.production', local, target);
  assert.deepEqual(result.manual, []);
  assert.equal(result.content, local + '\r\n' + target.slice(target.indexOf('export MULTI')).replaceAll('\n', '\r\n'));
  assert.deepEqual(parseEnv(result.content), { ...parseEnv(target), EXISTING: parseEnv(local).EXISTING });
  assert.equal(mergeProjectConfig('.env', result.content, target).content, result.content);
  const targetCrlf = 'MULTI="a\r\n#b=c"\r\nOTHER=ok\r\n';
  const lf = mergeProjectConfig('.env', '# 本地\n', targetCrlf);
  assert.equal(lf.content, '# 本地\nMULTI="a\n#b=c"\nOTHER=ok\n');
});

test('env: 重复键、复杂格式或未闭合 quote 任一侧出现均整份保留且提示不含值', () => {
  const invalid = [
    'KEY=PRIVATE_VALUE\nKEY=second\n',
    'KEY=PRIVATE_VALUE\nexport KEY=second\n',
    'VALID=ok\nBROKEN="PRIVATE_VALUE\nNEXT=hidden\n',
    "VALID=ok\nBROKEN='PRIVATE_VALUE\nNEXT=hidden\n",
    String.raw`BROKEN="PRIVATE_VALUE\"`,
    'KEY="PRIVATE_VALUE" trailing\n',
    'KEY="PRIVATE_VALUE" "other"\n',
    'KEY=abc"PRIVATE_VALUE"\n',
    'KEY: PRIVATE_VALUE\n',
    '[section]\nKEY=PRIVATE_VALUE\n',
    'source PRIVATE_VALUE\n',
    'export KEY\n',
    'KEY=`PRIVATE_VALUE`\n',
    'KEY=PRIVATE_VALUE\\\n',
    '__proto__=PRIVATE_VALUE\n',
    'KEY=PRIVATE_VALUE\0\n',
    'KEY=PRIVATE_VALUE\rNEXT=bad\r',
  ];
  for (const text of invalid) for (const [local, target] of [[text, 'NEW=TARGET_SECRET\n'], ['LOCAL=LOCAL_SECRET\n', 'ADD=TARGET_SECRET\n' + text]]) {
    const result = mergeProjectConfig('.env.local', local, target);
    assert.equal(result.content === local, true, '异常环境文件不得部分追加');
    assert.ok(result.manual.length);
    assert.doesNotMatch(result.manual.join(), /PRIVATE_VALUE|TARGET_SECRET|LOCAL_SECRET/);
  }
});

test('planner env: 同版本真实规划覆盖根目录和前后台，保留本地并安全创建，应用幂等可回滚', () => {
  const f = fixture();
  const local = '# 本地\r\nKEEP=LOCAL_SECRET\r\nEMPTY=';
  const target = '# 目标\nKEEP=TARGET_SECRET\nEMPTY=filled\nexport ADDED="first\n#inside=value\nlast"\n';
  const paths = ['', 'view/admin/', 'view/index/'].flatMap(prefix => ['.env', '.env.local', '.env.production'].map(name => prefix + name));
  for (const [index, path] of paths.entries()) {
    f.put('base', path, target); f.put('target', path, target);
    if (index % 2 === 0) f.put('root', path, local);
    assert.equal(projectConfigKind(path), 'env');
    assert.equal(isRepairableConfig(path), true);
  }
  const plan = makePlan(f.root, f.target, f.target, '1.3.9', {});
  assert.equal(plan.changes.length, paths.length);
  assert.deepEqual(plan.skipped, []);
  assert.doesNotMatch(plan.manual.join(), /SECRET|inside=value/);
  for (const [index, path] of paths.entries()) {
    const change = plan.changes.find(item => item.path === path);
    assert.equal(change.action, index % 2 === 0 ? 'merge' : 'create');
    assert.equal(change.content.toString(), index % 2 === 0 ? local + '\r\nexport ADDED="first\r\n#inside=value\r\nlast"\r\n' : target);
  }
  const directory = applyPlan(f.root, plan, '1.3.9', '1.3.9');
  assert.deepEqual(makePlan(f.root, f.target, f.target, '1.3.9', {}).changes, []);
  rollback(f.root, directory);
  for (const [index, path] of paths.entries()) {
    if (index % 2 === 0) assert.equal(readFileSync(join(f.root, path), 'utf8'), local);
    else assert.equal(existsSync(join(f.root, path)), false);
  }
});

test('planner env: 用户 skipExisting 优先，缺失仍创建，复杂文件及 envrc 不覆盖', () => {
  const f = fixture();
  const rules = { '.env*': true, 'view/*/.env*': true, '.env.local': false };
  for (const path of ['.env', '.env.local', 'view/admin/.env.production', 'view/index/.env.local']) {
    f.put('root', path, 'LOCAL=LOCAL_SECRET\n');
    f.put('target', path, 'NEW=TARGET_SECRET\n');
  }
  f.put('target', 'view/admin/.env.local', '# 完整新文件\r\nNEW=TARGET_SECRET');
  f.put('target', '.env.production', '# 空模板\r\n');
  f.put('target', 'view/index/.env', '');
  f.put('root', 'nested/.env', 'LOCAL=LOCAL_SECRET\n');
  for (const path of ['nested/.env', 'nested/.env.local', 'nested/.envrc']) f.put('target', path, 'NEW=TARGET_SECRET\nBAD="PRIVATE_VALUE');
  for (const path of ['identical/.env', 'skipped/.env']) {
    f.put('root', path, 'BAD="PRIVATE_VALUE\n');
    f.put('target', path, 'BAD="PRIVATE_VALUE\n');
  }
  rules['skipped/.env'] = true;
  const plan = makePlan(f.root, f.base, f.target, '1.3.9', rules);
  assert.ok(plan.manual.some(message => message.startsWith('identical/.env:')));
  assert.ok(!plan.manual.some(message => message.startsWith('skipped/.env:')));
  assert.deepEqual(new Set(plan.changes.map(item => item.path)), new Set(['.env.local', 'view/admin/.env.local', '.env.production', 'view/index/.env']));
  assert.equal(plan.skipped.length, 4);
  for (const path of ['nested/.env', 'nested/.env.local', 'nested/.envrc']) assert.ok(plan.manual.some(message => message.startsWith(path + ':')));
  assert.doesNotMatch([...plan.manual, ...plan.skipped].join(), /LOCAL_SECRET|TARGET_SECRET|PRIVATE_VALUE/);
  assert.equal(plan.changes.find(item => item.path === 'view/admin/.env.local').content.toString(), '# 完整新文件\r\nNEW=TARGET_SECRET');
  assert.equal(plan.changes.find(item => item.path === '.env.production').content.toString(), '# 空模板\r\n');
  assert.equal(plan.changes.find(item => item.path === 'view/index/.env').content.length, 0);
});

test('工程分类覆盖扫描所得根目录、前后台、测试与编辑器配置', () => {
  const paths = ['pnpm-workspace.yaml', '.npmrc', 'tsconfig.json', '.mocharc.json', 'nx.json', '.prettierrc.js', 'eslint.config.js', '.editorconfig', '.gitignore', '.npmignore', '.prettierignore', 'test/tsconfig.json', '.vscode/settings.json'];
  for (const view of ['admin', 'index']) for (const name of ['tsconfig.app.json', 'tsconfig.json', 'tsconfig.node.json', '.prettierrc.js', 'vite.config.ts', 'eslint.config.js', '.gitignore', '.npmignore', '.prettierignore']) paths.push(`view/${view}/${name}`);
  for (const path of paths) assert.ok(projectConfigKind(path), path);
  assert.equal(projectConfigKind('src/app/controller/config.controller.ts'), undefined);
});
