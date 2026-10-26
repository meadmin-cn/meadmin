import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyPlan, rollback } from '../dist/update/backup.js';
import { makePlan } from '../dist/update/planner.js';
import { loadConfig } from '../dist/update/rules.js';

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'meadmin-update-drift-'));
  const paths = { root: join(dir, 'project'), base: join(dir, 'base'), target: join(dir, 'target') };
  Object.values(paths).forEach((p) => mkdirSync(p));
  const put = (where, path, text) => {
    mkdirSync(join(paths[where], path, '..'), { recursive: true });
    writeFileSync(join(paths[where], path), text);
  };
  return { ...paths, put };
}

const ROUTER = 'view/index/src/router/index.ts';
const rules = { skipExisting: {}, mergeSource: { 'view/index/src/router/**/*.ts': 'routes' }, defaultPolicy: 'overwrite', autoIntegration: false };
const options = { sql: { enabled: false } };

// 目标模板（含新导出）
const targetRouter = `import type { RouteRecordRaw } from 'vue-router';
export const routeBase = '/';
export const normalizeRouteUrl = (url: string) => url || '/';
export const constantRoutes: RouteRecordRaw[] = [{ path: '/page404' }];
`;
// 旧模板与目标一致＝该文件在两次发布之间没变
const oldRouter = targetRouter;
// 本地是更早的版本：缺 normalizeRouteUrl
const staleRouter = targetRouter.replace("export const normalizeRouteUrl = (url: string) => url || '/';\n", '');

const run = (f) => makePlan(f.root, f.base, f.target, '1.9.9', rules.skipExisting, rules.mergeSource, { ...rules, ...options });

test('路由文件本地是旧版本、模板未变时，按模板覆盖而不是静默保留', () => {
  const f = fixture();
  f.put('root', ROUTER, staleRouter);
  f.put('base', ROUTER, oldRouter);
  f.put('target', ROUTER, targetRouter);
  const plan = run(f);
  const change = plan.changes.find((item) => item.path === ROUTER);
  assert.ok(change, '应产生变更');
  assert.equal(change.action, 'overwrite');
  assert.equal(change.content.toString('utf8'), targetRouter);
  assert.ok(plan.aligned.some((item) => item.includes('本地缺少模板导出 normalizeRouteUrl')), '应提示缺少导出并可回滚');
});

test('结构可识别的路由数组仍然走合并，保留本地新增路由', () => {
  const f = fixture();
  // 本地与目标都是静态数组字面量，本地多了 /custom，目标多了 /new-page
  const localRouter = `export const constantRoutes = [{ path: '/page404' }, { path: '/custom' }];\n`;
  const newRouter = `export const constantRoutes = [{ path: '/page404' }, { path: '/new-page' }];\n`;
  f.put('root', ROUTER, localRouter);
  f.put('base', ROUTER, `export const constantRoutes = [{ path: '/page404' }];\n`);
  f.put('target', ROUTER, newRouter);
  const plan = run(f);
  const change = plan.changes.find((item) => item.path === ROUTER);
  assert.ok(change, '应产生变更');
  assert.equal(change.action, 'merge');
  const merged = change.content.toString('utf8');
  assert.ok(merged.includes('/custom'), '本地新增路由应保留');
  assert.ok(merged.includes('/new-page'), '模板新增路由应合入');
});

// 增量合并「只增不减」：本地与旧模板一致时若还走合并，旧实现会被原样保留。
const HELPER = 'view/index/src/utils/helper.ts';
const helperRules = { skipExisting: {}, mergeSource: { 'view/index/src/utils/**/*.ts': 'functions' }, defaultPolicy: 'overwrite', autoIntegration: false };
const runHelper = (f) => makePlan(f.root, f.base, f.target, '1.9.9', helperRules.skipExisting, helperRules.mergeSource, { ...helperRules, ...options });

const oldHelper = `import dayjs from 'dayjs';
export function formatterAt(str?: string) {
  return dayjs(str).format('YYYY-MM-DD');
}
`;
// 新模板改写了已有函数体，并新增了一个函数
const newHelper = `import dayjs from 'dayjs';
export function formatterAt(str?: string) {
  return str ? dayjs(str).format('YYYY-MM-DD HH:mm:ss') : '--';
}
export function formatterAtExec(str?: string) {
  return str ? dayjs(str).format('YYYY-MM-DD HH:mm:ss') : '--';
}
`;

test('本地与旧模板一致时直接取新模板，不因增量合并留下旧函数体', () => {
  const f = fixture();
  f.put('root', HELPER, oldHelper);
  f.put('base', HELPER, oldHelper);
  f.put('target', HELPER, newHelper);
  const plan = runHelper(f);
  const change = plan.changes.find((item) => item.path === HELPER);
  assert.ok(change, '应产生变更');
  assert.equal(change.action, 'overwrite');
  assert.equal(change.content.toString('utf8'), newHelper, '应逐字节等于新模板');
  assert.equal(change.conflict, false, '用户没改过，不算冲突');
});

test('本地有用户自己的改动时仍走合并，不被快速路径覆盖', () => {
  const f = fixture();
  const local = oldHelper + `\nexport function maskPhone(v: string) {\n  return v;\n}\n`;
  f.put('root', HELPER, local);
  f.put('base', HELPER, oldHelper);
  f.put('target', HELPER, newHelper);
  const plan = runHelper(f);
  const change = plan.changes.find((item) => item.path === HELPER);
  assert.ok(change, '应产生变更');
  assert.equal(change.action, 'merge');
  const merged = change.content.toString('utf8');
  assert.ok(merged.includes('maskPhone'), '用户自定义函数应保留');
  assert.ok(merged.includes('formatterAtExec'), '模板新增函数应合入');
  assert.equal(change.conflict, true, '本地有改动应标记冲突');
});

// 集成入口（exports 模式）只追加、不更新已有项，是旧实现被留在文件里的另一条路。
const ENTRY = 'view/admin/src/store/module.ts';
const entryRules = { skipExisting: {}, mergeSource: { 'view/admin/src/store/*.ts': 'exports' }, defaultPolicy: 'overwrite', autoIntegration: false };
const runEntry = (f) => makePlan(f.root, f.base, f.target, '1.9.9', entryRules.skipExisting, entryRules.mergeSource, { ...entryRules, ...options });

const entry = (title, extra = '') => `export const menus = [{ path: '/home', title: '${title}' }${extra}];\n`;

test('集成入口里模板改了已有项的值、本地没动过时，整段换成模板的数组', () => {
  const f = fixture();
  f.put('root', ENTRY, entry('旧首页'));
  f.put('base', ENTRY, entry('旧首页'));
  f.put('target', ENTRY, entry('新首页'));
  const plan = runEntry(f);
  // 本地与基线一致、又与模板不同 → 走 planner 的快速路径直接覆盖，结果必须等于模板
  const change = plan.changes.find((item) => item.path === ENTRY);
  assert.ok(change, '应产生变更');
  assert.equal(change.content.toString('utf8'), entry('新首页'));
  assert.ok(!change.content.toString('utf8').includes('旧首页'));
});

test('集成入口里只有某个注册表被用户改过时，其余注册表整体跟随模板', () => {
  const f = fixture();
  // 用户只往 widgets 里加了 custom；menus 原样未动
  f.put('root', ENTRY, `import { home } from './home.js';
import { chart } from './chart.js';
import { custom } from './custom.js';
export const menus = [home];
export const widgets = [chart, custom];
`);
  f.put('base', ENTRY, `import { home } from './home.js';
import { chart } from './chart.js';
export const menus = [home];
export const widgets = [chart];
`);
  f.put('target', ENTRY, `import { home, order } from './home.js';
import { chart } from './chart.js';
export const menus = [home, order];
export const widgets = [chart];
`);
  const plan = runEntry(f);
  const change = plan.changes.find((item) => item.path === ENTRY);
  assert.ok(change, '应产生变更');
  const merged = change.content.toString('utf8');
  assert.match(merged, /menus = \[home, order\]/, '用户没动过的注册表应整体跟随模板，而不是只追加');
  assert.match(merged, /widgets = \[chart, custom\]/, '用户改过的注册表应保留本地增量');
  assert.match(merged, /import \{ order \} from/, '模板新增的导入应补齐');
});

test('模板来源清单命中时，本地与上一版模板不同也按模板覆盖', async () => {
  const f = fixture();
  f.put('root', HELPER, oldHelper); // 与 base 相同 —— 先构造「已漂移」的本地
  f.put('base', HELPER, newHelper); // 本地不等于上一版模板
  f.put('target', HELPER, newHelper);
  // 清单记录的正是本地内容 ⇒ 用户没改过，只是历史升级漏更新
  const stale = 'export function formatterAt() {\n  return "old";\n}\n';
  writeFileSync(join(f.root, HELPER), stale);
  mkdirSync(join(f.root, 'node_modules/.meadmin'), { recursive: true });
  writeFileSync(
    join(f.root, 'node_modules/.meadmin/template-state.json'),
    JSON.stringify({ version: '1.3.16', files: { [HELPER]: createHash('sha256').update(stale).digest('hex') } }),
  );
  assert.ok(!stale.includes('formatterAtExec'));
  const plan = runHelper(f);
  const change = plan.changes.find((item) => item.path === HELPER);
  assert.ok(change, '应产生变更');
  assert.equal(change.action, 'overwrite');
  assert.equal(change.content.toString('utf8'), newHelper, '应按模板覆盖而不是增量合并');
});

test('升级写入后刷新清单，rollback 再把清单还原', () => {
  const f = fixture();
  f.put('root', HELPER, oldHelper);
  f.put('base', HELPER, oldHelper);
  f.put('target', HELPER, newHelper);
  const stateFile = join(f.root, 'node_modules/.meadmin/template-state.json');
  mkdirSync(join(f.root, 'node_modules/.meadmin'), { recursive: true });
  writeFileSync(stateFile, JSON.stringify({ version: '1.3.16', files: {} }));

  const plan = runHelper(f);
  const directory = applyPlan(f.root, plan, '1.3.16', '1.3.17');
  const after = JSON.parse(readFileSync(stateFile, 'utf8'));
  assert.equal(after.version, '1.3.17', '版本应推进');
  assert.equal(after.files[HELPER], createHash('sha256').update(newHelper).digest('hex'), '应记录升级后内容');
  assert.equal(readFileSync(join(f.root, HELPER), 'utf8'), newHelper);

  rollback(f.root, directory);
  assert.equal(readFileSync(join(f.root, HELPER), 'utf8'), oldHelper, '文件应回滚');
  const restored = JSON.parse(readFileSync(stateFile, 'utf8'));
  assert.equal(restored.version, '1.3.16', '清单应回到升级前版本');
  assert.equal(restored.files[HELPER], undefined, '清单应回到升级前内容');
});

// router/routes/** 是用户加路由的地方，默认策略「以本地为准」：改过的保留，没改过的仍随模板升级。
const ROUTES = 'view/index/src/router/routes/003-user.ts';
const runDefault = (f) => {
  const config = loadConfig(f.root, undefined);
  return makePlan(f.root, f.base, f.target, '1.9.9', config.skipExisting, config.mergeSource, config);
};
const oldRoutes = `export const routes = [{ path: '/user' }];\n`;
const newRoutes = `export const routes = [{ path: '/user' }, { path: '/order' }];\n`;

test('默认策略下 routes 目录未改动时仍随模板升级', () => {
  const f = fixture();
  f.put('root', ROUTES, oldRoutes);
  f.put('base', ROUTES, oldRoutes);
  f.put('target', ROUTES, newRoutes);
  const plan = runDefault(f);
  const change = plan.changes.find((item) => item.path === ROUTES);
  assert.ok(change, '应产生变更');
  assert.equal(change.action, 'overwrite');
  assert.equal(change.content.toString('utf8'), newRoutes);
});

test('默认策略下 routes 目录被用户改过时以本地为准，不覆盖不合并', () => {
  const f = fixture();
  const local = `export const routes = [{ path: '/user' }, { path: '/custom' }];\n`;
  f.put('root', ROUTES, local);
  f.put('base', ROUTES, oldRoutes);
  f.put('target', ROUTES, newRoutes);
  const plan = runDefault(f);
  assert.equal(plan.changes.find((item) => item.path === ROUTES), undefined, '不应产生任何写入');
  assert.ok(plan.manual.some((item) => item.startsWith(ROUTES) && item.includes('按配置保留本地')), '应提示保留本地');
});
