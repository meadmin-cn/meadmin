import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { makePlan } from '../dist/update/planner.js';
import { applyPlan, rollback, safePath } from '../dist/update/backup.js';
import { excluded, loadConfig, mappedPath, sourceMode, validateConfig, validateRules } from '../dist/update/rules.js';
import { projectConfigKind } from '../dist/update/project-config.js';

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'meadmin-policy-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const paths = { root: join(directory, 'project'), base: join(directory, 'base'), target: join(directory, 'target') };
  for (const path of Object.values(paths)) mkdirSync(path);
  const put = (where, path, content) => {
    mkdirSync(join(paths[where], path, '..'), { recursive: true });
    writeFileSync(join(paths[where], path), content);
  };
  const plan = (config = {}) => makePlan(paths.root, paths.base, paths.target, '1.1.0', {}, {}, config);
  return { ...paths, directory, put, plan };
}

for (const path of ['pnpm-lock.yaml', 'nested/package-lock.json', 'yarn.lock', 'build.tsbuildinfo', 'node_modules/dependency/data.bin', 'nested/node_modules/dependency/data.bin', 'dist/chunk.js', 'nested/DIST/chunk.js', '.git/config', '.meadmin/data', 'logs/current.log']) {
  test(`默认排除可精确开放，apply/rollback 字节一致：${path}`, t => {
    const f = fixture(t), local = Buffer.from([0xff, 0, 0x81]), target = Buffer.from([0x80, 0, 0xfe]);
    f.put('root', path, local); f.put('target', path, target);
    assert.equal(f.plan().changes.length, 0);
    const config = { exclude: { [path]: false } };
    const plan = f.plan(config);
    assert.equal(plan.changes.length, 1);
    assert.equal(plan.changes[0].path, path);
    const backup = applyPlan(f.root, plan, '1.0.0', '1.1.0');
    assert.deepEqual(readFileSync(join(f.root, path)), target);
    assert.equal(f.plan(config).changes.length, 0);
    rollback(f.root, backup);
    assert.deepEqual(readFileSync(join(f.root, path)), local);
  });
}

test('排除祖先不可剪枝，精确 false 只重新包含子文件，大小写一致', t => {
  const f = fixture(t);
  const files = ['node_modules/one/deep/keep.bin', 'node_modules/one/drop.bin', 'nested/node_modules/two/drop.bin', 'dist/deep/keep.bin', 'dist/drop.bin', 'pnpm-lock.yaml'];
  for (const path of files) f.put('target', path, '目标');
  const config = { exclude: { '**/node_modules/**': true, 'NODE_MODULES/ONE/DEEP/KEEP.BIN': false, dist: true, 'dist/deep/keep.bin': false, 'PNPM-LOCK.YAML': false } };
  const plan = f.plan(config);
  assert.deepEqual(plan.changes.map(x => x.path).sort(), ['dist/deep/keep.bin', 'node_modules/one/deep/keep.bin', 'pnpm-lock.yaml']);
  const backup = applyPlan(f.root, plan, '1.0.0', '1.1.0');
  rollback(f.root, backup);
  for (const path of files) assert.equal(existsSync(join(f.root, path)), false);
  assert.equal(excluded('anything/child', { anything: true }), true);
  assert.equal(excluded('anything/child', { anything: true, 'anything/child': false }), false);
  assert.equal(excluded('node_modules/one/keep', { '**/node_modules/**': true, 'node_modules/one': false }), false);
  assert.throws(() => excluded('DIST/a', { 'dist/**': true, 'DIST/**': false }), /冲突/);
});

test('排除组 false 开放默认，逐 key true 可保护已有及缺失文件', t => {
  const f = fixture(t);
  for (const path of ['dist/a', 'node_modules/a', 'pnpm-lock.yaml', 'ordinary.txt']) f.put('target', path, 'new');
  assert.equal(f.plan({ exclude: false }).changes.length, 4);
  f.put('root', 'ordinary.txt', 'old');
  const plan = f.plan({ exclude: { '**/dist/**': false, 'ordinary.txt': true, 'missing.txt': true } });
  assert.deepEqual(plan.changes.map(x => x.path), ['dist/a']);
});

test('三组 false 关闭默认；mergeSource false 只关闭整组，autoIntegration 独立控制', t => {
  const f = fixture(t);
  const target = 'export default { added: true };';
  for (const path of ['src/config/default.ts', 'public/a.ts', 'dist/a.ts']) {
    f.put('root', path, 'export default { local: true };'); f.put('target', path, target);
  }
  const plan = f.plan({ exclude: false, skipExisting: false, mergeSource: false, autoIntegration: false });
  assert.equal(plan.changes.length, 3);
  assert.ok(plan.changes.every(x => x.action === 'overwrite' && x.content.toString() === target));
  assert.equal(validateRules({ skipExisting: false }), false);
  assert.equal(sourceMode('src/config/default.ts', false), undefined);
  f.put('root', 'registry.ts', "export { mine } from './mine.js';");
  f.put('target', 'registry.ts', "export { added } from './added.js';");
  assert.equal(f.plan({ mergeSource: false }).changes.find(x => x.path === 'registry.ts').action, 'merge');
  assert.equal(f.plan({ mergeSource: false, autoIntegration: false }).changes.find(x => x.path === 'registry.ts').action, 'overwrite');
});

test('逐 key false 禁止自动识别并回普通覆盖，优先于 manual/skip 默认值', t => {
  const f = fixture(t), target = "export { added } from './added.js';";
  f.put('root', 'registry.ts', "export { mine } from './mine.js';"); f.put('target', 'registry.ts', target);
  for (const defaultPolicy of ['manual', 'skip']) {
    const plan = f.plan({ defaultPolicy, mergeSource: { 'registry.ts': false } });
    assert.equal(plan.changes[0].action, 'overwrite'); assert.equal(plan.changes[0].content.toString(), target);
  }
});

test('任意路径 env/entity/package/config 策略可生效并实际回滚', t => {
  const f = fixture(t);
  const samples = {
    'custom/settings.data': ['env', 'KEY=local\n', 'KEY=target\nADDED=yes\n', /KEY=local\nADDED=yes/],
    'custom/model.data': ['entity', 'export class User { local = 1; }', 'export class User { added = 2; }', /local = 1/],
    'custom/deps.data': ['package', '{"name":"local","dependencies":{"custom":"1"}}', '{"dependencies":{"added":"2"}}', /custom/],
    'custom/config.data': ['config', 'export default {local:true}', 'export default {added:true}', /local:true/],
  };
  for (const [path, [, local, target]] of Object.entries(samples)) { f.put('root', path, local); f.put('target', path, target); }
  const config = { mergeSource: Object.fromEntries(Object.entries(samples).map(([path, [mode]]) => [path, mode])) };
  assert.equal(projectConfigKind('custom/settings.data', config.mergeSource), 'env');
  const plan = f.plan(config);
  assert.equal(plan.changes.length, 4, plan.manual.join());
  for (const change of plan.changes) { assert.equal(change.action, 'merge'); assert.match(change.content.toString(), samples[change.path][3]); assert.match(change.content.toString(), /added|ADDED/); }
  const backup = applyPlan(f.root, plan, '1.0.0', '1.1.0');
  rollback(f.root, backup);
  for (const [path, [, local]] of Object.entries(samples)) assert.equal(readFileSync(join(f.root, path), 'utf8'), local);
});

for (const mode of [false, 'overwrite']) test(`所有默认特殊策略可被用户覆盖：${mode}`, t => {
  const f = fixture(t);
  const paths = ['src/config/default.ts', 'src/entities/a.ts', 'package.json', '.env', 'tsconfig.json', 'pnpm-workspace.yaml', '.gitignore', '.npmrc', 'vite.config.ts', '.envrc'];
  for (const path of paths) { f.put('root', path, 'local'); f.put('target', path, 'target'); }
  const plan = f.plan({ mergeSource: { '**': mode }, sql: false });
  assert.equal(plan.changes.length, paths.length);
  assert.ok(plan.changes.every(x => x.action === 'overwrite' && x.content.toString() === 'target'));
  assert.deepEqual(plan.manual.filter(x => !x.includes('SQL')), []);
});

test('skip 缺失也不创建，manual 仅已有转人工，skipExisting 缺失仍创建', t => {
  const f = fixture(t);
  for (const path of ['skip.txt', 'manual.txt', 'manual-existing.txt', 'existing.txt', 'public/existing.txt', 'public/new.txt']) f.put('target', path, 'target');
  f.put('root', 'existing.txt', 'local'); f.put('root', 'public/existing.txt', 'local'); f.put('root', 'manual-existing.txt', 'local');
  const plan = f.plan({ sql: false, skipExisting: { 'existing.txt': true }, mergeSource: { 'skip.txt': 'skip', 'manual*.txt': 'manual', 'existing.txt': 'overwrite', 'public/**': 'overwrite' } });
  assert.deepEqual(plan.changes.map(x => x.path), ['manual.txt', 'public/new.txt']);
  assert.ok(plan.changes.every(x => x.action === 'create' && x.previous === null && x.content.equals(Buffer.from('target'))));
  assert.deepEqual(plan.skipped.sort(), ['existing.txt: 存在时跳过', 'public/existing.txt: 存在时跳过', 'skip.txt: 完全跳过']);
  assert.deepEqual(plan.manual, ['manual-existing.txt: 按配置保留本地，需人工处理']);
  for (const defaultPolicy of ['manual', 'skip']) {
    const result = f.plan({ sql: false, defaultPolicy, mergeSource: false, skipExisting: false });
    assert.deepEqual(result.changes.map(x => x.path), defaultPolicy === 'skip' ? [] : ['manual.txt', 'public/new.txt', 'skip.txt']);
    assert.equal(result.skipped.length, defaultPolicy === 'skip' ? 6 : 0);
    assert.equal(result.manual.length, defaultPolicy === 'manual' ? 3 : 0);
    assert.ok(result.changes.every(x => x.action === 'create' && x.content.equals(Buffer.from('target'))));
  }
  const backup = applyPlan(f.root, plan, '1.0.0', '1.1.0');
  for (const path of ['manual.txt', 'public/new.txt']) assert.equal(readFileSync(join(f.root, path), 'utf8'), 'target');
  assert.equal(readFileSync(join(f.root, 'manual-existing.txt'), 'utf8'), 'local');
  assert.equal(existsSync(join(f.root, 'skip.txt')), false);
  rollback(f.root, backup);
  for (const path of ['manual.txt', 'public/new.txt']) assert.equal(existsSync(join(f.root, path)), false);
});

test('缺失真实 AI-README、任意 Markdown、二进制与隐藏文件逐字节创建，备份回滚且重复幂等', t => {
  const f = fixture(t);
  const template = new URL('../../create-meadmin/template/meadmin/AI-README.md', import.meta.url);
  assert.ok(existsSync(template), '真实模板必须包含 AI-README.md');
  const readme = readFileSync(template);
  assert.ok(readme.length > 0);
  const files = {
    'AI-README.md': readme,
    'docs/nested/任意说明.md': Buffer.from('\uFEFF# 任意文档\r\n\r\n保留末尾空格  '),
    'assets/nested/data.bin': Buffer.from([0, 0xff, 0x80, 0xc3, 0x28, 13, 10]),
    '.hidden': Buffer.from([0xff, 0, 0x81]),
    '.settings/nested/.hidden': Buffer.from('隐藏内容\r\n'),
    'empty.md': Buffer.alloc(0),
  };
  for (const [path, content] of Object.entries(files)) {
    f.put('base', path, content); f.put('target', path, content);
  }
  const local = Buffer.from([0xfe, 0, 0x82]);
  f.put('root', 'existing.bin', local); f.put('target', 'existing.bin', Buffer.from([1, 0xff]));
  f.put('root', 'local-only.md', '本地独有');
  const plan = f.plan({ sql: false });
  assert.equal(plan.changes.length, Object.keys(files).length + 1);
  assert.deepEqual(plan.manual, []); assert.deepEqual(plan.skipped, []);
  for (const [path, content] of Object.entries(files)) {
    assert.deepEqual(plan.changes.find(change => change.path === path), { path, action: 'create', previous: null, content, conflict: false });
    assert.equal(existsSync(join(f.root, path)), false);
  }
  const backup = applyPlan(f.root, plan, '1.1.0', '1.1.0');
  const record = JSON.parse(readFileSync(join(backup, 'record.json'), 'utf8'));
  assert.equal(record.phase, 'files-complete');
  assert.equal(record.files.length, plan.changes.length);
  for (const [path, content] of Object.entries(files)) {
    assert.deepEqual(readFileSync(join(f.root, path)), content);
    assert.deepEqual(readFileSync(join(backup, 'target', path)), content);
    assert.equal(existsSync(join(backup, 'original', path)), false);
    const saved = record.files.find(file => file.path === path);
    assert.equal(saved.before, null); assert.equal(saved.state, 'written');
  }
  assert.deepEqual(readFileSync(join(backup, 'original/existing.bin')), local);
  assert.deepEqual(f.plan({ sql: false }).changes, []);
  rollback(f.root, backup);
  for (const path of Object.keys(files)) assert.equal(existsSync(join(f.root, path)), false);
  assert.deepEqual(readFileSync(join(f.root, 'existing.bin')), local);
  assert.equal(readFileSync(join(f.root, 'local-only.md'), 'utf8'), '本地独有');
  assert.equal(JSON.parse(readFileSync(join(backup, 'record.json'), 'utf8')).phase, 'rolled-back');
  assert.deepEqual(f.plan({ sql: false }), plan);
});

const unparsedFiles = [
  ['.env', Buffer.from('\uFEFF# 独立头\r\n\r\nBAD="PRIVATE_VALUE\r\n'), 'LOCAL=local\n'],
  ['pnpm-workspace.yaml', Buffer.from('packages: [\r\n'), 'custom: true\n'],
  ['nested/pnpm-workspace.yaml', Buffer.from('# 锚点\r\nx: &x {a: 1}\r\ny: *x'), 'custom: true\n'],
  ['tsconfig.json', Buffer.from('{ "compilerOptions": '), '{}'],
  ['vite.config.ts', Buffer.from('export default makeConfig();\r\n'), 'export default {};'],
  ['src/config/default.ts', Buffer.from('export default { ...defaults };\r\n'), 'export default {};'],
  ['.envrc', Buffer.from('source ./dynamic-env\r\n'), '本地配置'],
];
for (const [path, content, local] of unparsedFiles) test(`不解析缺失文件原样创建，已有不安全配置仍转人工：${path}`, t => {
  const f = fixture(t);
  f.put('base', path, content); f.put('target', path, content);
  const plan = f.plan({ sql: false });
  assert.deepEqual(plan.changes, [{ path, action: 'create', previous: null, content, conflict: false }]);
  assert.deepEqual(plan.manual, []); assert.deepEqual(plan.skipped, []);
  const backup = applyPlan(f.root, plan, '1.1.0', '1.1.0');
  assert.deepEqual(readFileSync(join(f.root, path)), content);
  assert.deepEqual(readFileSync(join(backup, 'target', path)), content);
  assert.deepEqual(f.plan({ sql: false }).changes, []);
  rollback(f.root, backup);
  assert.equal(existsSync(join(f.root, path)), false);
  f.put('root', path, local);
  const existing = f.plan({ sql: false });
  assert.deepEqual(existing.changes, []);
  assert.ok(existing.manual.some(message => message.startsWith(path + ':')));
  assert.doesNotMatch(existing.manual.join(), /PRIVATE_VALUE/);
  assert.equal(readFileSync(join(f.root, path), 'utf8'), local);
});

for (const mode of ['manual', 'default-manual', 'skip', 'default-skip', 'exclude', 'skipExisting']) test(`缺失文件策略适用于文档、二进制、隐藏和特殊配置：${mode}`, t => {
  const f = fixture(t);
  const files = {
    'AI-README.md': readFileSync(new URL('../../create-meadmin/template/meadmin/AI-README.md', import.meta.url)),
    'arbitrary/nested.md': Buffer.from('# 文档\r\n'),
    'assets/data.bin': Buffer.from([0xff, 0, 0x80]),
    '.hidden/data': Buffer.from('隐藏文件'),
    ...Object.fromEntries(unparsedFiles.map(([path, content]) => [path, content])),
  };
  const options = { sql: false };
  const rules = value => Object.fromEntries(Object.keys(files).map(path => [path, value]));
  if (mode === 'exclude') options.exclude = rules(true);
  else if (mode === 'skipExisting') options.skipExisting = rules(true);
  else if (mode.startsWith('default-')) {
    options.defaultPolicy = mode.slice('default-'.length);
    options.mergeSource = false; options.autoIntegration = false;
  } else options.mergeSource = rules(mode);
  for (const [path, content] of Object.entries(files)) f.put('target', path, content);
  const create = ['manual', 'default-manual', 'skipExisting'].includes(mode);
  const plan = f.plan(options);
  assert.equal(plan.changes.length, create ? Object.keys(files).length : 0);
  assert.deepEqual(plan.manual, []);
  for (const change of plan.changes) assert.deepEqual(change, { path: change.path, action: 'create', previous: null, content: files[change.path], conflict: false });
  const backup = applyPlan(f.root, plan, '1.1.0', '1.1.0');
  for (const [path, content] of Object.entries(files)) {
    assert.equal(existsSync(join(f.root, path)), create, path);
    if (create) assert.deepEqual(readFileSync(join(f.root, path)), content);
  }
  assert.deepEqual(f.plan(options).changes, []);
  rollback(f.root, backup);
  for (const path of Object.keys(files)) {
    assert.equal(existsSync(join(f.root, path)), false);
    f.put('root', path, Buffer.alloc(0));
  }
  const existing = f.plan(options);
  assert.deepEqual(existing.changes, []);
  assert.equal(existing.manual.length, ['manual', 'default-manual'].includes(mode) ? Object.keys(files).length : 0);
  for (const path of Object.keys(files)) assert.deepEqual(readFileSync(join(f.root, path)), Buffer.alloc(0));
});

test('缺失动态 script/config 仅复制，规划、应用、幂等和回滚均不执行配置', t => {
  const f = fixture(t);
  const marker = '__missingConfigExecuted';
  const before = Object.getOwnPropertyDescriptor(globalThis, marker);
  t.after(() => { if (before) Object.defineProperty(globalThis, marker, before); else delete globalThis[marker]; });
  globalThis[marker] = false;
  const content = Buffer.from(`globalThis.${marker} = true;\r\nexport default (() => ({ dynamic: Date.now() }))();\r\n`);
  const paths = ['dynamic.config.ts', 'src/config/dynamic.ts'];
  for (const path of paths) f.put('target', path, content);
  const plan = f.plan({ sql: false });
  assert.equal(plan.changes.length, paths.length); assert.deepEqual(plan.manual, []);
  const backup = applyPlan(f.root, plan, '1.1.0', '1.1.0');
  for (const path of paths) assert.deepEqual(readFileSync(join(f.root, path)), content);
  assert.deepEqual(f.plan({ sql: false }).changes, []);
  rollback(f.root, backup);
  assert.equal(globalThis[marker], false);
  for (const path of paths) assert.equal(existsSync(join(f.root, path)), false);
});

test('用户通配压过默认精确，用户精确优先且模糊冲突拒绝猜测', () => {
  assert.equal(sourceMode('src/ruleType/index.ts', { 'src/**': 'overwrite' }), 'overwrite');
  assert.equal(sourceMode('src/ruleType/index.ts', { 'src/**': 'overwrite', 'src/ruleType/index.ts': 'exports' }), 'exports');
  assert.equal(sourceMode('src/api/a.ts', { 'src/**': 'overwrite', 'src/api/**': 'functions' }), 'functions');
  assert.throws(() => sourceMode('src/api/a.ts', { 'src/*/a.ts': 'entity', 'src/api/*.ts': 'functions' }), /冲突/);
});

test('模板默认映射可逐 key false 或整组关闭，嵌套路径保持，精确重定向可用', t => {
  const f = fixture(t);
  f.put('target', 'packageTemplate.json', '{}'); f.put('target', 'apps/a/packageTemplate.json', '{}');
  assert.deepEqual(f.plan().changes.map(x => x.path).sort(), ['apps/a/package.json', 'package.json']);
  for (const templateMappings of [false, { '**/packageTemplate.json': false }]) assert.deepEqual(f.plan({ templateMappings }).changes.map(x => x.path).sort(), ['apps/a/packageTemplate.json', 'packageTemplate.json']);
  assert.equal(mappedPath('apps/a/packageTemplate.json', { 'apps/a/packageTemplate.json': 'custom/deps.json' }), 'custom/deps.json');
  assert.deepEqual(f.plan({ templateMappings: { 'packageTemplate.json': false } }).changes.map(x => x.path).sort(), ['apps/a/package.json', 'packageTemplate.json']);
});

for (const destination of ['package.json', 'PACKAGE.JSON', 'package.json/child']) test(`模板映射冲突明确拒绝：${destination}`, t => {
  const f = fixture(t); f.put('target', 'packageTemplate.json', '{}'); f.put('target', 'other', 'x');
  assert.throws(() => f.plan({ templateMappings: { other: destination } }), /冲突/);
});

const sqlText = "CREATE TABLE t(id text PRIMARY KEY); INSERT INTO t(id) VALUES ('x');";
test('SQL false/enabled false 不生成，源回归普通策略；默认路径也可关闭', t => {
  const f = fixture(t); f.put('target', 'meadmin.sql', sqlText);
  for (const sql of [false, { enabled: false }]) {
    const plan = f.plan({ sql });
    assert.deepEqual(plan.changes.map(x => x.path), ['meadmin.sql']);
    assert.deepEqual(plan.sqlTables, []);
    assert.deepEqual(plan.manual, []);
  }
  assert.deepEqual(f.plan({ sql: false, mergeSource: { 'meadmin.sql': 'skip' } }).changes, []);
});

test('SQL 自定义 source/output/originalName，产物 skip/exclude/skipExisting 均生效', t => {
  const f = fixture(t); f.put('target', 'seed/data.sql', sqlText);
  const sql = { source: 'seed/data.sql', output: 'migrations/next.sql', originalName: 'snapshots/{version}.sql' };
  const plan = f.plan({ sql });
  assert.deepEqual(plan.changes.map(x => x.path), ['snapshots/1.1.0.sql', 'migrations/next.sql']);
  assert.equal(plan.sqlTables.length, 1);
  const backup = applyPlan(f.root, plan, '1.0.0', '1.1.0'); rollback(f.root, backup);
  assert.equal(existsSync(join(f.root, 'migrations/next.sql')), false);
  const skipped = f.plan({ sql, mergeSource: { 'migrations/next.sql': 'skip', 'snapshots/1.1.0.sql': 'skip' } });
  assert.deepEqual(skipped.changes, []); assert.equal(skipped.skipped.length, 2); assert.deepEqual(skipped.sqlTables, []);
  assert.deepEqual(f.plan({ sql, exclude: { 'migrations/**': true, 'snapshots/**': true } }).changes, []);
  f.put('root', 'migrations/next.sql', 'local');
  const protectedPlan = f.plan({ sql: { ...sql, originalName: false }, skipExisting: { 'migrations/next.sql': true } });
  assert.deepEqual(protectedPlan.changes, []); assert.deepEqual(protectedPlan.sqlTables, []);
  assert.deepEqual(f.plan({ sql, mergeSource: { 'seed/data.sql': 'skip' } }).changes, []);
  assert.deepEqual(f.plan({ sql: { ...sql, output: false, originalName: false } }).changes, []);
});

test('默认 SQL 产物 skip 与 overwrite false 策略遵循普通文件规则', t => {
  const f = fixture(t); f.put('target', 'meadmin.sql', sqlText);
  const plan = f.plan({ mergeSource: { 'update.sql': 'skip', 'meadmin-1.1.0.sql': 'skip' } });
  assert.equal(plan.changes.length, 0); assert.equal(plan.skipped.length, 2);
  const output = f.plan({ defaultPolicy: 'manual', mergeSource: { 'meadmin.sql': false, 'update.sql': false, 'meadmin-1.1.0.sql': false } });
  assert.equal(output.changes.length, 2);
});

for (const sql of [{ source: 'update.sql' }, { originalName: 'update.sql' }, { originalName: 'UPDATE.SQL' }, { output: 'meadmin.sql/child' }, { output: 'node_modules/.meadmin/updates/attack' }]) test(`SQL 自覆盖或产物冲突拒绝：${JSON.stringify(sql)}`, t => {
  const f = fixture(t); f.put('target', 'meadmin.sql', sqlText);
  assert.throws(() => f.plan({ sql }), /冲突|自覆盖/);
});

test('SQL 产物与模板映射结果冲突明确错误，可禁用 SQL 消除', t => {
  const f = fixture(t); f.put('target', 'meadmin.sql', sqlText); f.put('target', 'update.sql', 'template');
  assert.throws(() => f.plan(), /冲突/);
  assert.equal(f.plan({ sql: false }).changes.length, 2);
});

for (const path of ['../outside', '/absolute', 'C:/escape', 'folder/../../escape', 'x\\y', 'a//b', 'a/./b', 'file:stream', 'nul.txt', 'file.']) test(`不安全配置路径校验：${path}`, () => {
  for (const field of ['exclude', 'skipExisting', 'mergeSource', 'templateMappings']) assert.throws(() => validateConfig({ [field]: { [path]: false } }), /无效/);
  assert.throws(() => validateConfig({ templateMappings: { source: path } }), /无效/);
  for (const field of ['source', 'output', 'originalName']) assert.throws(() => validateConfig({ sql: { [field]: path } }), /无效/);
});

test('SQL 同版本生成默认关闭，可显式开启或关闭且仅接受 boolean', () => {
  assert.equal(validateConfig({}).sql.generateOnSameVersion, false);
  assert.equal(validateConfig({ sql: false }).sql.generateOnSameVersion, false);
  for (const generateOnSameVersion of [true, false]) assert.equal(validateConfig({ sql: { generateOnSameVersion } }).sql.generateOnSameVersion, generateOnSameVersion);
  for (const generateOnSameVersion of ['false', 'true', 0, 1, null, {}, []]) assert.throws(() => validateConfig({ sql: { generateOnSameVersion } }), /sql 配置无效：generateOnSameVersion/);
});

test('所有非法配置类型拒绝；完整策略枚举均可通过', () => {
  for (const config of [{ exclude: true }, { skipExisting: null }, { mergeSource: [] }, { autoIntegration: 'false' }, { defaultPolicy: false }, { templateMappings: { '*.json': 'file' } }, { sql: null }, { sql: { source: false } }, { sql: { enabled: 'false' } }, { sql: { extra: 1 } }, { unknown: true }]) assert.throws(() => validateConfig(config));
  for (const mode of ['package', 'entity', 'config', 'script', 'env', 'yaml', 'json', 'npmrc', 'ignore', 'manual', 'functions', 'exports', 'validation', 'routes', 'overwrite', 'skip', false]) assert.equal(validateConfig({ mergeSource: { arbitrary: mode } }).mergeSource.arbitrary, mode);
});

test('开放排除不能写入活跃历史目录，planner/apply/rollback 统一拒绝且预检不写备份', t => {
  const f = fixture(t), path = 'node_modules/.meadmin/updates/attack';
  f.put('target', path, 'bad');
  assert.throws(() => f.plan({ exclude: false }), /自覆盖/);
  assert.throws(() => f.plan({ exclude: { [path]: false } }), /自覆盖/);
  const unsafe = { changes: [{ path, action: 'create', previous: null, content: Buffer.from('bad'), conflict: false }], manual: [], skipped: [], sqlTables: [] };
  assert.throws(() => applyPlan(f.root, unsafe, '1.0.0', '1.1.0'), /自覆盖/);
  assert.equal(existsSync(join(f.root, 'node_modules')), false);
  for (const path of ['../outside', 'node_modules', 'NODE_MODULES/.MEADMIN/UPDATES/x']) assert.throws(() => safePath(f.root, path));
  const backup = applyPlan(f.root, { changes: [], manual: [], skipped: [], sqlTables: [] }, '1.0.0', '1.1.0');
  const record = JSON.parse(readFileSync(join(backup, 'record.json'), 'utf8'));
  record.files.push({ path, state: 'written', before: null, after: 'bad' }); writeFileSync(join(backup, 'record.json'), JSON.stringify(record));
  assert.throws(() => rollback(f.root, backup), /自覆盖/);
});

test('源目标目录重叠和目标父链 junction 一律拒绝，不依赖排除策略', t => {
  const f = fixture(t);
  assert.throws(() => makePlan(f.root, f.root, f.target, '1.1.0', {}, {}, { exclude: false }), /重叠/);
  const outside = join(f.directory, 'outside'); mkdirSync(outside);
  symlinkSync(outside, join(f.root, 'linked'), 'junction');
  f.put('target', 'linked/file', 'bad');
  assert.throws(() => f.plan({ exclude: false }), /符号链接|逃逸/);
  assert.equal(existsSync(join(outside, 'file')), false);
  assert.throws(() => safePath(join(f.root, 'linked'), 'file'), /符号链接|逃逸/);
});

test('模板符号链接、源父链 junction、映射越界及历史目录映射均拒绝', t => {
  const f = fixture(t); const outside = join(f.directory, 'outside'); mkdirSync(outside);
  symlinkSync(outside, join(f.target, 'linked'), 'junction');
  assert.throws(() => f.plan(), /符号链接/);
  assert.throws(() => makePlan(f.root, f.base, join(f.target, 'linked'), '1.1.0', {}), /符号链接|逃逸/);
  const g = fixture(t); g.put('target', 'file', 'bad');
  assert.throws(() => g.plan({ templateMappings: { file: '../outside' } }), /无效/);
  assert.throws(() => g.plan({ templateMappings: { file: 'node_modules/.meadmin/updates/attack' } }), /自覆盖/);
});

test('发布包包含完整默认 JSON，所有默认规则通过同一配置校验', () => {
  const defaults = JSON.parse(readFileSync(new URL('../template/update.defaults.json', import.meta.url), 'utf8'));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.files.includes('template'));
  assert.deepEqual(validateConfig(defaults), defaults);
  for (const [path, policy] of [['.env', 'env'], ['apps/a/.env.production', 'env'], ['.envrc', 'manual'], ['tsconfig.node.json', 'json'], ['.eslintrc.yaml', 'manual'], ['.mocharc.cjs', 'script'], ['src/config/default.ts', 'config'], ['src/entities/user.ts', 'entity'], ['apps/a/package.json', 'package']]) assert.equal(sourceMode(path), policy, path);
});

test('无法证明优先级的双通配排除规则明确报错；精确文件消除歧义', () => {
  const exclude = { '**/cache/**': true, 'apps/**': false };
  assert.throws(() => excluded('apps/cache/file', exclude), /冲突/);
  assert.equal(excluded('apps/cache/file', { ...exclude, 'apps/cache/file': false }), false);
});

test('apply 拒绝恶意越界及大小写重名计划，写备份前完成校验', t => {
  const f = fixture(t);
  const change = path => ({ path, action: 'create', previous: null, content: Buffer.from('bad'), conflict: false });
  for (const changes of [[change('../outside')], [change('a'), change('A')], [change('a'), change('a/child')]]) {
    assert.throws(() => applyPlan(f.root, { changes, manual: [], skipped: [], sqlTables: [] }, '1.0.0', '1.1.0'), /无效|冲突/);
    assert.equal(existsSync(join(f.root, 'node_modules')), false);
  }
});

test('update.json 优先，兼容旧入口，显式配置覆盖；损坏主配置不回退', t => {
  const f = fixture(t);
  assert.equal(loadConfig(f.root).defaultPolicy, 'overwrite');
  f.put('root', 'meadmin.update.json', '{"defaultPolicy":"skip"}'); assert.equal(loadConfig(f.root).defaultPolicy, 'skip');
  f.put('root', 'update.json', '{"defaultPolicy":"manual"}'); assert.equal(loadConfig(f.root).defaultPolicy, 'manual');
  f.put('root', 'custom.json', '{"exclude":false}'); assert.equal(loadConfig(f.root, 'custom.json').exclude, false);
  f.put('root', 'update.json', '{broken'); assert.throws(() => loadConfig(f.root), SyntaxError);
  assert.equal(loadConfig(f.root, 'custom.json').exclude, false);
  assert.throws(() => loadConfig(f.root, 'missing.json'), /不存在/);
});
