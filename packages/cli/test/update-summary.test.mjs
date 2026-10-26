import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRemaining } from '../dist/update/summary.js';

const base = { installed: true, synced: true, syncFailed: false, sqlReady: true, sqlExecuted: true, treesRepaired: true, sqlPath: 'update.sql' };

test('依赖没装（答否）时清单第一条必须是 pnpm install', () => {
  const list = buildRemaining({ ...base, installed: false });
  assert.match(list[0], /pnpm install/);
  assert.match(list[0], /新增依赖未安装可能导致启动失败/);
});

test('依赖装好后不再提 pnpm install', () => {
  assert.equal(buildRemaining(base).some((item) => item.includes('pnpm install')), false);
});

test('全部完成时只剩「刷新重登核对」一条', () => {
  assert.deepEqual(buildRemaining(base), ['刷新/重新登录并核对菜单授权、组织数据范围和业务功能']);
});

test('没同步表结构时提醒 sync，并带上 -m', () => {
  const list = buildRemaining({ ...base, installed: false, synced: false, sqlExecuted: false, treesRepaired: false, env: 'local' });
  assert.equal(list.length, 5);
  assert.match(list[0], /pnpm install/);
  assert.match(list[1], /pnpm exec meadmin sync '\*' -m local/);
  assert.match(list[2], /再人工执行 update\.sql/);
  assert.match(list[3], /修复树关系/);
});

test('sync 执行失败时不再重复列 sync / update.sql（已单独提示过），但仍提修树', () => {
  const list = buildRemaining({ ...base, installed: false, synced: false, syncFailed: true, sqlExecuted: false, treesRepaired: false });
  assert.equal(list.length, 3);
  assert.match(list[0], /pnpm install/);
  assert.match(list[1], /修复树关系/);
  assert.equal(list.some((item) => item.includes("meadmin sync '*'")), false);
});

test('没生成 update.sql 时不提执行它', () => {
  const list = buildRemaining({ ...base, installed: false, sqlReady: false, sqlExecuted: false, treesRepaired: false });
  assert.equal(list.some((item) => item.includes('再人工执行')), false);
  assert.equal(list[1], '在后台依次执行菜单、组织、角色的「修复树关系」');
});

test('默认不带 -m 时命令里也不出现 -m', () => {
  const list = buildRemaining({ ...base, installed: false, synced: false });
  assert.equal(list[1].includes(' -m '), false);
});
