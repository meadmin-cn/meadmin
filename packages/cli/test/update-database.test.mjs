import test from 'node:test';
import assert from 'node:assert/strict';
import { runDatabaseSteps } from '../dist/update/database.js';

/** 记录调用顺序的依赖桩 */
function deps(answers, options = {}) {
  const calls = [];
  const errors = [];
  return {
    calls,
    errors,
    deps: {
      confirm: async (message) => {
        calls.push(`ask:${message}`);
        const next = answers.shift();
        if (next === 'throw') throw new Error('非交互式终端');
        return next === true;
      },
      sync: async () => {
        calls.push('sync');
        if (options.syncThrows) throw new Error('连不上数据库');
      },
      executeSql: async () => {
        calls.push('sql');
        if (options.sqlThrows) throw new Error('SQL 执行报错');
      },
      repairTrees: async () => {
        calls.push('trees');
        if (options.treesThrows) throw new Error('模型未找到');
        return ['SystemMenu', 'SystemOrganization', 'SystemRole'];
      },
      error: (message) => errors.push(message),
    },
  };
}

const run = (answers, options = {}) => {
  const stub = deps(answers, options);
  return runDatabaseSteps({ sqlReady: options.sqlReady ?? true, sqlPath: 'update.sql', deps: stub.deps }).then((result) => ({ result, ...stub }));
};

test('先问 sync、最后问 update.sql；两步都确认时按顺序执行，并自动修复树关系', async () => {
  const { result, calls, errors } = await run([true, true]);
  assert.deepEqual(calls, [
    "ask:是否现在执行 meadmin sync '*' 同步表结构？缺表/缺字段时必须执行，会改动数据库表结构。",
    'sync',
    'ask:是否现在执行 update.sql？会修改数据库数据、不保证幂等，请确认已备份数据库。',
    'sql',
    'trees',
  ]);
  assert.deepEqual(result, { questions: [calls[0].slice(4), calls[2].slice(4)], synced: true, sqlExecuted: true, syncFailed: false, treesRepaired: true });
  assert.deepEqual(errors, []);
  // 最后一句提问必须是 update.sql（树关系修复是自动步骤，不再提问）
  assert.match(result.questions.at(-1), /是否现在执行 update\.sql/);
});

test('拒绝 sync 时仍会询问 update.sql，但提示里点明表结构未同步', async () => {
  const { result, calls, errors } = await run([false, false]);
  assert.equal(calls.length, 2, '仍应问 update.sql');
  assert.equal(result.synced, false);
  assert.equal(result.sqlExecuted, false);
  assert.match(result.questions.at(-1), /表结构尚未同步/);
  assert.match(result.questions.at(-1), /是否现在执行 update\.sql/);
  assert.deepEqual(errors, []);
});

test('同意了 sync 但执行失败时中止，不再询问 update.sql', async () => {
  const { result, calls, errors } = await run([true, true], { syncThrows: true });
  assert.deepEqual(calls.slice(0, 2), [calls[0], 'sync']);
  assert.equal(calls.length, 2, '不应再问 update.sql');
  assert.equal(result.synced, false);
  assert.equal(result.syncFailed, true, '失败要与用户拒答区分开');
  assert.match(errors[0], /同步表结构失败：连不上数据库/);
  assert.match(errors[0], /文件升级不受影响/);
});

test('sync 执行失败时 sqlExecuted 保持 false，便于上层提示人工执行', async () => {
  const { result } = await run([true, true], { syncThrows: true });
  assert.equal(result.sqlExecuted, false);
  assert.equal(result.questions.length, 1);
});

test('update.sql 执行失败时报错，但 sync 的成功状态保留', async () => {
  const { result, errors } = await run([true, true], { sqlThrows: true });
  assert.equal(result.synced, true);
  assert.equal(result.sqlExecuted, false);
  assert.match(errors[0], /执行 update\.sql 失败：SQL 执行报错/);
});

test('没有 update.sql 时只问 sync', async () => {
  const { result, calls } = await run([true], { sqlReady: false });
  assert.deepEqual(calls, ["ask:是否现在执行 meadmin sync '*' 同步表结构？缺表/缺字段时必须执行，会改动数据库表结构。", 'sync']);
  assert.equal(result.sqlExecuted, false);
});

test('确认本身失败（非交互终端）不吞异常语义，按 sync 失败处理', async () => {
  const { result, errors } = await run(['throw']);
  assert.equal(result.synced, false);
  assert.match(errors[0], /同步表结构失败/);
});

// ---- syncDatabase：真的执行命令 + -m 透传 ----
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncDatabase } from '../dist/update/database.js';

const fixture = new URL('./fixtures/sync-project', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const probe = () => join(tmpdir(), `meadmin-env-probe-${randomUUID()}.txt`);

test('sync 透传 -m：子进程按同一个 .env.<env> 加载配置', async (t) => {
  const file = probe();
  process.env.FIXTURE_PROBE_FILE = file;
  t.after(() => {
    delete process.env.FIXTURE_PROBE_FILE;
  });
  await assert.rejects(syncDatabase(fixture, 'test'), /meadmin sync '\*' -m test 执行失败（退出码 1）/);
  assert.equal(readFileSync(file, 'utf8'), 'from-env-test', '应加载 .env.test 而不是 .env');
});

test('不传 -m 时子进程只加载 .env', async (t) => {
  const file = probe();
  process.env.FIXTURE_PROBE_FILE = file;
  t.after(() => {
    delete process.env.FIXTURE_PROBE_FILE;
  });
  await assert.rejects(syncDatabase(fixture, ''), /meadmin sync '\*' 执行失败（退出码 1）/);
  assert.equal(readFileSync(file, 'utf8'), 'from-env', '未指定 env 时不应加载 .env.test');
});

test('update.sql 执行阶段按 -m 读取数据库信息（走 CLI 真实钩子，不是进程内模拟）', () => {
  const run = (args) =>
    spawnSync(process.execPath, ['probe.mjs', ...args], { cwd: fixture, encoding: 'utf8', timeout: 60000 });
  // fixture 里 .env 给 DATABASE_PORT=1、.env.test 给 2；端口不同即可证明读的是哪份 env
  const tagged = run(['-m', 'test']);
  assert.match(tagged.stdout + tagged.stderr, /数据库目标：127\.0\.0\.1:2/);
  assert.match(tagged.stdout + tagged.stderr, /ECONNREFUSED 127\.0\.0\.1:2/);
  const plain = run([]);
  assert.match(plain.stdout + plain.stderr, /数据库目标：127\.0\.0\.1:1/);
  assert.match(plain.stdout + plain.stderr, /ECONNREFUSED 127\.0\.0\.1:1/);
});

test('答了 sync 但拒绝 update.sql 时不做树关系修复', async () => {
  const { result, calls, errors } = await run([true, false]);
  assert.deepEqual(calls.filter((call) => !call.startsWith('ask:')), ['sync'], '只执行 sync，不执行 sql / trees');
  assert.equal(result.sqlExecuted, false);
  assert.equal(result.treesRepaired, false);
  assert.deepEqual(errors, []);
});

test('sync 失败时不执行 update.sql，也不修复树关系', async () => {
  const { result } = await run([true, true], { syncThrows: true });
  assert.equal(result.sqlExecuted, false);
  assert.equal(result.treesRepaired, false);
});

test('update.sql 执行失败时不修复树关系（数据没进去，重算没有意义）', async () => {
  const { result, calls, errors } = await run([true, true], { sqlThrows: true });
  assert.deepEqual(calls.filter((call) => !call.startsWith('ask:')), ['sync', 'sql']);
  assert.equal(result.sqlExecuted, false);
  assert.equal(result.treesRepaired, false);
  assert.match(errors[0], /执行 update\.sql 失败/);
});

test('树关系自动修复失败时报错并回落到手动提示', async () => {
  const { result, calls, errors } = await run([true, true], { treesThrows: true });
  assert.deepEqual(calls.filter((call) => !call.startsWith('ask:')), ['sync', 'sql', 'trees']);
  assert.equal(result.sqlExecuted, true, 'SQL 已执行成功，这个状态不能因为修树失败而回退');
  assert.equal(result.treesRepaired, false);
  assert.match(errors[0], /自动修复树关系失败：模型未找到/);
  assert.match(errors[0], /在后台依次点一次菜单、组织、角色的「修复树关系」/);
});
