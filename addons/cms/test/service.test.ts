// 在隔离仓储上执行实际服务源码，不连接数据库；事务/SQL 的真实行为仍需另行集成验收。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { Op } from '@sequelize/core';
import { BadRequestError, ForbiddenError, NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { CmsPermissionMiddleware } from '../../../src/app/admin/addons/cms/controller/permission.middleware.js';
import { ResponseService } from '../../../src/service/response.service.js';
import { CmsNotFoundMiddleware } from '../../../src/app/index/addons/cms/controller/notfound.middleware.js';
import { RuleType } from '../../../src/ruleType/index.js';
import { assertCmsParent, canSubmitCms, cmsId, validateCms } from '../../../src/app/admin/addons/cms/service/guard.js';
const rules = { querySchema: RuleType.object({ page: RuleType.number().integer().min(1).max(100000).default(1), pageSize: RuleType.number().integer().min(1).max(100).default(20), status: RuleType.number(), keyword: RuleType.string().allow(''), categoryId: RuleType.string(), topicId: RuleType.string(), tagId: RuleType.string() }), reviewSchema: RuleType.object({ approve: RuleType.boolean().required(), reason: RuleType.string().max(1000).allow('').default('') }).unknown(false) };
const load = (relative: string, name: string, extras: Record<string, unknown> = {}) => {
  const filename = new URL('../../../' + relative, import.meta.url);
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, experimentalDecorators: true, emitDecoratorMetadata: false } }).outputText;
  const exports: Record<string, any> = {};
  const noop = () => () => undefined;
  const deps = { Op, Provide: noop, Inject: noop, InjectRepository: noop, Transaction: noop, BadRequestError, NotFoundError, cmsId, validateCms, canSubmitCms, assertCmsParent, ...rules, ...extras };
  vm.runInNewContext(output, { exports, require: () => deps, Date, Set, Map, console });
  return new exports[name]();
};
test('公开列表强制发布状态和时间条件；拒绝超大分页', async () => {
  const service = load('src/app/index/addons/cms/service/cms.service.ts', 'AonCmsPublicService');
  service.category = { findAll: async () => [{ id: '1', parentId: null, status: 1 }, { id: '2', parentId: '1', status: 0 }, { id: '3', parentId: '2', status: 1 }] };
  let query: any;
  service.article = { findAndCountAll: async (q: any) => { query = q; return { rows: [], count: 0 }; } };
  const result = await service.articles({ page: 2, pageSize: 10, status: 0, keyword: 'hello' });
  assert.equal(result.total, 0);
  assert.equal(query.offset, 10);
  const visibility = query.where[Op.and][0];
  assert.equal(visibility.status, 2);
  assert.ok(visibility.publishAt[Op.lte] instanceof Date);
  assert.deepEqual(Array.from(visibility[Op.or][1].categoryId[Op.in]), ['1']);
  assert.ok(!query.attributes.includes('mdContent'));
  assert.ok(!query.attributes.includes('createdAdminId'));
  await assert.rejects(() => service.articles({ page: 1, pageSize: 101 }));
});
test('文章审核按状态流转，发布时间为空时写入当前时间', async () => {
  const service = load('src/app/admin/addons/cms/service/article.service.ts', 'AonCmsArticleService');
  const row = { id: '1', status: 0, mdContent: '正文', publishAt: null as Date | null, update: async (data: any) => Object.assign(row, data) };
  service.repository = { sequelize: { query: async () => undefined }, findByPk: async () => row };
  await assert.rejects(() => service.review('1', { approve: true }));
  await service.submit('1');
  assert.equal(row.status, 1);
  await service.review('1', { approve: true });
  assert.equal(row.status, 2);
  assert.ok(row.publishAt instanceof Date);
  await assert.rejects(() => service.submit('1'));
  await service.offline('1');
  assert.equal(row.status, 4);
  await service.submit('1');
  await service.review('1', { approve: false, reason: '内容需要补充来源说明' });
  assert.equal(row.status, 3);
});
test('隐藏文章的评论接口必须先失败，不读取评论仓储', async () => {
  const service = load('src/app/index/addons/cms/service/cms.service.ts', 'AonCmsPublicService');
  service.category = { findAll: async () => [] };
  service.article = { findOne: async () => null };
  let accessed = false;
  service.comment = { findAndCountAll: async () => { accessed = true; return { rows: [], count: 0 }; } };
  await assert.rejects(() => service.comments('draft', { page: 1, pageSize: 20 }));
  assert.equal(accessed, false);
});
test('编辑保存重置发布状态且拒绝状态注入', async () => {
  const schema = RuleType.object({ title: RuleType.string().required(), slug: RuleType.string().required(), tagIds: RuleType.array().default([]) }).unknown(false);
  const service = load('src/app/admin/addons/cms/service/article.service.ts', 'AonCmsArticleService', { articleSchema: schema });
  const row = { id: '1', status: 2, update: async (data: any) => Object.assign(row, data) };
  service.repository = { sequelize: { query: async () => undefined }, findByPk: async () => row, findOne: async () => null };
  await assert.rejects(() => service.save('1', { title: '修改', slug: 'changed', status: 2 }));
  assert.equal(row.status, 2);
  await service.save('1', { title: '修改', slug: 'changed' });
  assert.equal(row.status, 0);
});
test('文章引用删除返回友好 400，拒绝时不调用销毁，无引用时允许删除', async () => {
  const service = load('src/app/admin/addons/cms/service/article.service.ts', 'AonCmsArticleService');
  let destroyed = false;
  const calls: string[] = [];
  const row = { id: '1', destroy: async () => { destroyed = true; } };
  service.repository = { sequelize: { query: async () => { calls.push('lock'); } }, findByPk: async () => row };
  service.commentRepository = { count: async (query: any) => { calls.push('count'); assert.equal(query.where.articleId, '1'); return 1; } };
  await assert.rejects(() => service.remove('1'), (error: any) => error instanceof BadRequestError && error.status === 400 && error.message.includes('评论'));
  assert.equal(destroyed, false);
  assert.deepEqual(calls, ['lock', 'count']);
  service.commentRepository.count = async () => 0;
  await service.remove('1');
  assert.equal(destroyed, true);
});
test('CMS 权限拒绝使用框架业务 403 且保留其他异常', async () => {
  const middleware = new CmsPermissionMiddleware();
  middleware.responseService = new ResponseService();
  const handler = middleware.resolve();
  const ctx = { requestContext: { getAsync: async () => middleware.responseService } } as any;
  const response = await handler(ctx, async () => { throw new ForbiddenError('内部权限细节'); });
  assert.deepEqual(response, { code: '403', msg: '无权限访问！', data: undefined });
  const error = new BadRequestError('非法字段');
  await assert.rejects(() => handler(ctx, async () => { throw error; }), (actual) => actual === error);
});
test('CMS 不存在响应为 HTTP 404 及统一业务结构，不泄漏异常细节，不吞其他错误', async () => {
  const handler = new CmsNotFoundMiddleware().resolve();
  const ctx = { status: 200 } as any;
  const response = await handler(ctx, async () => { throw new NotFoundError('内部内容'); });
  assert.equal(ctx.status, 404);
  assert.deepEqual(response, { code: '404', msg: '内容不存在' });
  const error = new BadRequestError('参数不合法');
  await assert.rejects(() => handler(ctx, async () => { throw error; }), (actual) => actual === error);
  assert.deepEqual(await handler(ctx, async () => ({ code: '200' })), { code: '200' });
});

test('公开评论按根评论分页并携带完整回复树，空页保留根评论总数', async () => {
  const service = load('src/app/index/addons/cms/service/cms.service.ts', 'AonCmsPublicService');
  const roots = [
    { id: 'root-1', parentId: null, left: 1, right: 6 },
    { id: 'root-2', parentId: null, left: 7, right: 8 },
  ];
  const descendants = [
    ...roots,
    { id: 'reply-1', parentId: 'root-1', left: 2, right: 3 },
    { id: 'reply-2', parentId: 'reply-1', left: 4, right: 5 },
  ];
  const queries: any[] = [];
  service.category = { findAll: async () => [] };
  service.article = { findOne: async () => ({ id: 'article-1' }) };
  service.comment = {
    count: async (query: any) => {
      assert.equal(query.where.parentId, null);
      return 2;
    },
    findAll: async (query: any) => {
      queries.push(query);
      return query.limit ? [roots[query.offset ?? 0]] : descendants;
    },
  };
  const result = await service.comments('article', { page: 2, pageSize: 1 });
  assert.equal(result.total, 2);
  assert.equal(result.page, 2);
  assert.equal(queries[0].offset, 1);
  assert.equal(queries[0].limit, 1);
  assert.deepEqual(result.list.map((row: any) => row.id), ['root-2']);

  const firstPage = await service.comments('article', { page: 1, pageSize: 1 });
  assert.deepEqual(firstPage.list.map((row: any) => row.id), ['root-1', 'reply-1', 'reply-2']);
});
