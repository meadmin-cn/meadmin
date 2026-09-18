import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { clearHistory } from '../dist/update/backup.js';

function fixture() {
  const base = mkdtempSync(join(realpathSync(tmpdir()), 'meadmin-clear-history-'));
  const root = join(base, 'project');
  const updates = join(root, 'node_modules/.meadmin/updates');
  const outside = join(base, 'outside');
  mkdirSync(root);
  mkdirSync(outside);
  writeFileSync(join(root, 'package.json'), '{}');
  writeFileSync(join(outside, 'keep.txt'), '外部数据');
  const put = (path, content) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  };
  const batch = (id = `v1.3.6_to_v1.3.8_${randomUUID()}`, record) => {
    const directory = join(updates, id);
    put(join(directory, 'record.json'), record ?? JSON.stringify({ root, from: '1.3.6', to: '1.3.8', phase: 'files-complete', installation: 'not-run', files: [], manual: [] }));
    put(join(directory, 'original/src/app.ts'), '备份');
    put(join(directory, 'target/src/app.ts'), '升级后');
    return { id, directory };
  };
  const log = [];
  let confirmations = 0;
  const interaction = { isTTY: true, log: message => log.push(message), confirm: async message => { confirmations++; assert.match(message, /不可 rollback.*默认取消/); return true; } };
  return { base, root, updates, outside, put, batch, log, interaction, get confirmations() { return confirmations; } };
}

function execute(root, args, input = '') {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../dist/index.js', import.meta.url)), 'update', ...args], {
    cwd: root, encoding: 'utf8', input, timeout: 15000,
    env: { ...process.env, npm_config_registry: 'http://127.0.0.1:1', HTTP_PROXY: '', HTTPS_PROXY: '' },
  });
  assert.ifError(result.error);
  return { code: result.status, text: result.stdout + result.stderr };
}

for (const legacy of [false, true]) test(`指定${legacy ? '旧 UUID' : '带版本号'}批次：真实删除仅目标，先列完整路径及版本，保留业务和其他历史`, async () => {
  const f = fixture();
  const target = f.batch(legacy ? randomUUID() : undefined);
  const keep = f.batch();
  f.put(join(f.root, 'src/app.ts'), '业务文件');
  f.put(join(f.root, 'node_modules/package/keep.txt'), '依赖');
  f.put(join(f.root, 'node_modules/.meadmin/other/keep.txt'), '其他缓存');
  const confirm = f.interaction.confirm;
  f.interaction.confirm = message => {
    assert.ok(existsSync(target.directory));
    assert.ok(f.log.join('\n').includes(target.directory));
    assert.match(f.log.join('\n'), /版本：1\.3\.6 → 1\.3\.8/);
    assert.match(f.log.join('\n'), /永久删除.*不可 rollback/);
    return confirm(message);
  };
  assert.equal(await clearHistory(f.root, target.id, f.interaction), 1);
  assert.equal(f.confirmations, 1);
  assert.equal(existsSync(target.directory), false);
  assert.ok(existsSync(keep.directory));
  assert.ok(existsSync(f.updates));
  for (const [path, value] of [['src/app.ts', '业务文件'], ['node_modules/package/keep.txt', '依赖'], ['node_modules/.meadmin/other/keep.txt', '其他缓存']]) assert.equal(readFileSync(join(f.root, path), 'utf8'), value);
  assert.equal(existsSync(join(f.root, 'node_modules/@meadmin/core')), false);
});

test('all 清全部有效批次（含损坏或缺失 record），未知目录及其他 node_modules 内容保留', async () => {
  const f = fixture();
  const batches = [f.batch(), f.batch(randomUUID(), '{broken'), f.batch(undefined, 'null'), f.batch(undefined, '{}')];
  const missing = `v1.0.0_to_v1.1.0_${randomUUID()}`;
  mkdirSync(join(f.updates, missing));
  f.put(join(f.updates, 'unknown/record.json'), '{}');
  f.put(join(f.updates, randomUUID()), '合法名字但不是目录');
  f.put(join(f.root, 'node_modules/unrelated/keep'), '依赖');
  symlinkSync(f.outside, join(f.updates, 'unknown-link'), 'junction');
  assert.equal(await clearHistory(f.root, 'all', f.interaction), 5);
  for (const batch of batches) { assert.equal(existsSync(batch.directory), false); assert.ok(f.log.join('\n').includes(batch.directory)); }
  assert.equal(existsSync(join(f.updates, missing)), false);
  assert.match(f.log.join('\n'), /记录缺失或损坏/);
  assert.match(f.log.join('\n'), /未知（旧 UUID 批次）/);
  assert.match(f.log.join('\n'), /1\.0\.0 → 1\.1\.0（目录名）/);
  assert.ok(existsSync(join(f.updates, 'unknown/record.json')));
  assert.ok(lstatSync(join(f.updates, 'unknown-link')).isSymbolicLink());
  assert.equal(readFileSync(join(f.outside, 'keep.txt'), 'utf8'), '外部数据');
  assert.equal(readFileSync(join(f.root, 'node_modules/unrelated/keep'), 'utf8'), '依赖');
});

test('无历史 all 不创建目录、不要求确认；指定不存在批次报错', async () => {
  const f = fixture();
  assert.equal(await clearHistory(f.root, 'all', f.interaction), 0);
  await assert.rejects(clearHistory(f.root, randomUUID(), f.interaction), /批次不存在/);
  f.batch();
  await assert.rejects(clearHistory(f.root, randomUUID(), f.interaction), /批次不存在/);
  assert.equal(f.confirmations, 0);
});

test('取消和确认异常均不删除', async () => {
  const f = fixture(), batch = f.batch();
  assert.equal(await clearHistory(f.root, 'all', { ...f.interaction, confirm: async () => false }), 0);
  assert.ok(existsSync(batch.directory));
  assert.match(f.log.join('\n'), /已取消/);
  await assert.rejects(clearHistory(f.root, 'all', { ...f.interaction, confirm: async () => { throw new Error('终端关闭'); } }), /终端关闭/);
  assert.ok(existsSync(batch.directory));
});

test('非 TTY 即使注入同意也拒绝，空历史同样拒绝', async () => {
  const f = fixture();
  await assert.rejects(clearHistory(f.root, 'all', { ...f.interaction, isTTY: false }), /非 TTY/);
  const batch = f.batch();
  await assert.rejects(clearHistory(f.root, batch.id, { ...f.interaction, isTTY: false }), /非 TTY/);
  assert.equal(f.confirmations, 0);
  assert.ok(existsSync(batch.directory));
});

test('拒绝未知目录、路径穿越、绝对路径、反斜线和 ADS', async () => {
  const f = fixture(), batch = f.batch();
  f.put(join(f.updates, 'unknown/record.json'), '{}');
  for (const id of ['unknown', '', '..', '../' + batch.id, batch.id + '/..', '..\\' + batch.id, batch.directory, 'C:\\Users', batch.id + ':stream', 'ALL', batch.id + '\n']) {
    await assert.rejects(clearHistory(f.root, id, f.interaction), /备份ID无效/, id);
  }
  assert.equal(f.confirmations, 0);
  assert.ok(existsSync(batch.directory));
  assert.ok(existsSync(join(f.updates, 'unknown/record.json')));
});

for (const part of ['node_modules', 'node_modules/.meadmin', 'node_modules/.meadmin/updates']) test(`拒绝父链 junction：${part}`, async () => {
  const f = fixture(), batch = f.batch();
  const original = join(f.root, part), moved = join(f.base, 'moved');
  renameSync(original, moved);
  symlinkSync(moved, original, 'junction');
  await assert.rejects(clearHistory(f.root, 'all', f.interaction), /目录不安全/);
  assert.ok(existsSync(batch.directory));
  assert.equal(f.confirmations, 0);
});

for (const parent of [false, true]) test(`拒绝${parent ? '项目上级' : '项目根'} junction`, async () => {
  const f = fixture(), batch = f.batch();
  const alias = join(f.base, 'alias');
  if (parent) {
    const container = join(f.base, 'container');
    mkdirSync(container);
    renameSync(f.root, join(container, 'project'));
    symlinkSync(container, alias, 'junction');
  } else symlinkSync(f.root, alias, 'junction');
  await assert.rejects(clearHistory(parent ? join(alias, 'project') : alias, 'all', f.interaction), /目录不安全/);
  assert.equal(f.confirmations, 0);
  assert.ok(existsSync(join(parent ? join(f.base, 'container/project') : f.root, 'node_modules/.meadmin/updates', batch.id)));
});

for (const location of ['batch', 'original/link', 'target/deep/link', 'before-install/link', 'record.json']) test(`all 全部 preflight：拒绝 ${location} 链接，正常批次也不删除`, async () => {
  const f = fixture();
  const first = f.batch('00000000-0000-0000-0000-000000000000');
  const id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
  const directory = join(f.updates, id);
  if (location === 'batch') symlinkSync(f.outside, directory, 'junction');
  else {
    mkdirSync(directory);
    const link = join(directory, location);
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(f.outside, link, 'junction');
  }
  await assert.rejects(clearHistory(f.root, 'all', f.interaction), /符号链接/);
  await assert.rejects(clearHistory(f.root, id, f.interaction), /符号链接/);
  assert.ok(existsSync(first.directory));
  assert.equal(readFileSync(join(f.outside, 'keep.txt'), 'utf8'), '外部数据');
  assert.equal(f.confirmations, 0);
});

test('悬空批次 junction 同样拒绝', async () => {
  const f = fixture(), batch = f.batch();
  symlinkSync(join(f.base, 'missing'), join(f.updates, randomUUID()), 'junction');
  await assert.rejects(clearHistory(f.root, 'all', f.interaction), /符号链接/);
  assert.ok(existsSync(batch.directory));
});

test('批次中的文件 symlink 拒绝（系统无权限时明确跳过）', async t => {
  const f = fixture(), batch = f.batch();
  try { symlinkSync(join(f.outside, 'keep.txt'), join(batch.directory, 'original/file-link'), 'file'); }
  catch (error) { if (['EPERM', 'EACCES'].includes(error.code)) return t.skip('当前 Windows 未授予文件 symlink 权限'); throw error; }
  const linkStat = lstatSync(join(batch.directory, 'original/file-link'), { throwIfNoEntry: false });
  if (!linkStat && process.platform === 'win32') return t.skip('当前 Windows 执行环境未创建文件 symlink，junction 场景另行实测');
  assert.ok(linkStat?.isSymbolicLink(), 'fixture 必须生成真正的文件符号链接');
  await assert.rejects(clearHistory(f.root, 'all', f.interaction), /符号链接/);
  assert.ok(existsSync(batch.directory));
  assert.equal(readFileSync(join(f.outside, 'keep.txt'), 'utf8'), '外部数据');
});

for (const mutation of ['link', 'parent', 'new-batch', 'record']) test(`确认后重检全部批次：${mutation} 变化拒绝删除`, async () => {
  const f = fixture(), first = f.batch(), last = f.batch();
  const confirm = async () => {
    if (mutation === 'link') symlinkSync(f.outside, join(last.directory, 'original/link'), 'junction');
    if (mutation === 'parent') { renameSync(f.updates, join(f.base, 'moved')); symlinkSync(join(f.base, 'moved'), f.updates, 'junction'); }
    if (mutation === 'new-batch') f.batch();
    if (mutation === 'record') writeFileSync(join(last.directory, 'record.json'), '{}');
    return true;
  };
  await assert.rejects(clearHistory(f.root, 'all', { ...f.interaction, confirm }), /符号链接|目录不安全|备份发生变化/);
  assert.ok(existsSync(first.directory));
  assert.ok(existsSync(last.directory));
});

test('record 中的项目及文件路径不参与清理路径计算', async () => {
  const f = fixture();
  const batch = f.batch(undefined, JSON.stringify({ root: f.outside, from: '1.0.0', to: '1.1.0', files: [{ path: '../../outside/keep.txt' }] }));
  assert.equal(await clearHistory(f.root, batch.id, f.interaction), 1);
  assert.equal(readFileSync(join(f.outside, 'keep.txt'), 'utf8'), '外部数据');
});

test('CLI 无 core、不读配置或连接 registry；管道输入 y 仍拒绝删除', () => {
  const f = fixture(), batch = f.batch();
  f.put(join(f.root, 'meadmin.update.json'), '{broken');
  for (const id of [batch.id, 'all']) {
    const result = execute(f.root, ['--clear-history', id], 'y\n');
    assert.equal(result.code, 1, result.text);
    assert.match(result.text, /非 TTY/);
    assert.match(result.text, /不可 rollback/);
    assert.ok(result.text.includes(batch.directory));
    assert.ok(existsSync(batch.directory));
    assert.doesNotMatch(result.text, /未安装|fetch failed|ECONNREFUSED/);
  }
});

for (const args of [['--history'], ['--rollback', 'id'], ['--version', '1.3.8'], ['--dry-run'], ['--config', './missing.json'], ['--registry', 'http://127.0.0.1:1'], ['--version', ''], ['--config', ''], ['--registry', '']]) test(`CLI 拒绝混合选项 ${JSON.stringify(args)}`, () => {
  const f = fixture(), batch = f.batch();
  const result = execute(f.root, ['--clear-history', 'all', ...args]);
  assert.equal(result.code, 1, result.text);
  assert.match(result.text, /--clear-history 请单独使用/);
  assert.ok(existsSync(batch.directory));
});

test('CLI 缺失参数、非法 ID 和不存在批次均失败且保留备份', () => {
  const f = fixture(), batch = f.batch();
  for (const [args, pattern] of [[['--clear-history'], /argument missing/], [['--clear-history', '../outside'], /备份ID无效/], [['--clear-history', randomUUID()], /批次不存在/]]) {
    const result = execute(f.root, args);
    assert.equal(result.code, 1, result.text);
    assert.match(result.text, pattern);
  }
  assert.ok(existsSync(batch.directory));
});
