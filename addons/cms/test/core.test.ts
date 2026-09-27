import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assertCmsParent, canSubmitCms, cmsId, isCmsVisible, validateCms } from '../../../src/app/admin/addons/cms/service/guard.js';
import { RuleType } from '../../../src/ruleType/index.js';

test('栏目拒绝自环、后代环、缺失父级与已有坏环', () => {
  const nodes = [{ id: '1', parentId: null }, { id: '2', parentId: '1' }, { id: '3', parentId: '2' }];
  assert.doesNotThrow(() => assertCmsParent('3', '1', nodes));
  assert.doesNotThrow(() => assertCmsParent(undefined, null, nodes));
  assert.throws(() => assertCmsParent('1', '1', nodes));
  assert.throws(() => assertCmsParent('1', '3', nodes));
  assert.throws(() => assertCmsParent('1', '99', nodes));
  assert.throws(() => assertCmsParent(undefined, '1', [{ id: '1', parentId: '2' }, { id: '2', parentId: '1' }]));
});
test('公开状态边界不泄漏草稿、待审核、拒绝、下线、未来发布', () => {
  const now = new Date('2026-09-20T12:00:00Z');
  for (const status of [0, 1, 3, 4]) assert.equal(isCmsVisible(status, '2026-01-01', now), false);
  assert.equal(isCmsVisible(2, null, now), false);
  assert.equal(isCmsVisible(2, '2026-09-21T00:00:00Z', now), false);
  assert.equal(isCmsVisible(2, now, now), true);
  assert.equal(isCmsVisible(2, 'invalid', now), false);
});
test('提交审核只接受草稿、拒绝、下线', () => {
  assert.deepEqual([0, 1, 2, 3, 4].filter(canSubmitCms), [0, 3, 4]);
});
test('ID 与白名单校验拒绝越权字段和错误类型', () => {
  assert.equal(cmsId('123'), '123');
  for (const id of ['', '../1', '1 OR 1=1', '-1', '1'.repeat(21)]) assert.throws(() => cmsId(id));
  const schema = RuleType.object({ page: RuleType.number().integer().min(1).max(100).default(1) }).unknown(false);
  assert.deepEqual(validateCms(schema, {}), { page: 1 });
  assert.throws(() => validateCms(schema, { page: 0 }));
  assert.throws(() => validateCms(schema, { page: 101 }));
  assert.throws(() => validateCms(schema, { status: 2 }));
  assert.throws(() => validateCms(schema, { createdAdminId: '1' }));
});
test('所有写接口都有明确权限，公开端没有写接口', () => {
  const admin = new URL('../../../src/app/admin/addons/cms/controller/', import.meta.url);
  for (const name of fs.readdirSync(admin).filter((name) => name.endsWith('.controller.ts'))) {
    const source = fs.readFileSync(new URL(name, admin), 'utf8');
    const routes = source.split(/@(?:Post|Get)\(/).slice(1);
    assert.ok(routes.length > 0);
    for (const route of routes) assert.match(route.split(/async\s/)[0], /@AdminPermission\(/);
  }
  const source = fs.readFileSync(new URL('../../../src/app/index/addons/cms/controller/cms.controller.ts', import.meta.url), 'utf8');
  assert.match(source, /@Post\('\/comments\/:slug'\)/);
  assert.match(source, /@Post\('\/orders\/:slug'\)/);
  assert.doesNotMatch(source, /@AdminPermission\(/);
});

test('CMS 安装 SQL 覆盖评论树、下载和留言实体', () => {
  const sql = fs.readFileSync(new URL('../../../addons/cms/install.sql', import.meta.url), 'utf8');
  for (const fragment of ['parent_id varchar(20)', '"left" integer', '"right" integer', 'CREATE TABLE IF NOT EXISTS aon_cms_download', 'CREATE TABLE IF NOT EXISTS aon_cms_message']) {
    assert.ok(sql.includes(fragment), `安装 SQL 缺少: ${fragment}`);
  }
});
