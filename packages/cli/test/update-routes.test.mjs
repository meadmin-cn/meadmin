import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { mergeSource } from '../dist/update/source.js';
import { makePlan } from '../dist/update/planner.js';
import { sourceMode, validateConfig } from '../dist/update/rules.js';

const source = items => `export const routes = [${items}];`;
const fixture = path => readFileSync(new URL(`../../../view/index/src/router/${path}`, import.meta.url), 'utf8');
function ast(text) {
  const file = ts.createSourceFile('routes.ts', text, ts.ScriptTarget.Latest, true);
  assert.deepEqual(file.parseDiagnostics, [], text);
  return file;
}
function array(text, name = 'routes') {
  return ast(text).statements.filter(ts.isVariableStatement).flatMap(item => [...item.declarationList.declarations]).find(item => item.name.getText() === name).initializer;
}
const property = (node, key) => node.properties.find(item => item.name?.getText().replace(/['"]/g, '') === key)?.initializer;
const paths = node => node.elements.map(item => property(item, 'path')?.text);
function merge(local, target, base = undefined) {
  const result = mergeSource(local, target, base, 'routes');
  ast(result.content);
  assert.equal(result.changed, result.content !== local);
  const again = mergeSource(result.content, target, base, 'routes');
  assert.equal(again.content, result.content, again.manual.join('\n'));
  assert.equal(again.changed, false);
  return result;
}
function semantic(text) {
  const options = { noLib: true, noResolve: true, target: ts.ScriptTarget.Latest, module: ts.ModuleKind.ESNext };
  const file = ast(text);
  const host = ts.createCompilerHost(options);
  host.getSourceFile = name => name === 'routes.ts' ? file : undefined;
  const program = ts.createProgram(['routes.ts'], options, host);
  assert.deepEqual(program.getSemanticDiagnostics(file).filter(item => ![2307, 2318, 2711, 2792].includes(item.code)).map(item => ts.flattenDiagnosticMessageText(item.messageText, '\n')), [], text);
}

test('routes 同级 path 优先，递归补齐子路由且已有属性完整保留', () => {
  const local = source(`{ path: '/a', name: 'local', component: () => import('./local.vue'), meta: { title: '本地' }, redirect: '/custom', children: [{ path: 'x', meta: { custom: true } }] }, { path: '/local' }`);
  const target = source(`{ path: '/a', name: 'template', component: () => import('./target.vue'), meta: { title: '目标', added: true }, redirect: '/target', children: [{ path: 'x', meta: { custom: false }, children: [{ path: 'leaf' }] }, { path: 'y' }] }, { path: '/new', children: [{ path: 'x' }] }`);
  const result = merge(local, target, target);
  const output = array(result.content);
  assert.deepEqual(paths(output), ['/a', '/local', '/new']);
  const parent = output.elements[0];
  assert.equal(property(parent, 'name').text, 'local');
  assert.equal(property(parent, 'meta').getText(), "{ title: '本地' }");
  assert.equal(property(parent, 'component').getText(), "() => import('./local.vue')");
  assert.equal(property(parent, 'redirect').text, '/custom');
  assert.deepEqual(paths(property(parent, 'children')), ['x', 'y']);
  assert.equal(property(property(parent, 'children').elements[0], 'meta').getText(), '{ custom: true }');
  assert.deepEqual(paths(property(property(parent, 'children').elements[0], 'children')), ['leaf']);
  assert.deepEqual(result.manual, []);
});

test('routes 同名本地 path 改动无条件保留，不依赖基线', () => {
  const local = source("{ path: '/custom', name: 'same', meta: { local: true } }");
  const target = source("{ path: '/template', name: 'same', children: [{ path: 'new' }] }");
  for (const base of [undefined, local, target, '']) {
    const result = merge(local, target, base);
    assert.equal(result.content, local);
    assert.match(result.manual.join(), /同名.*path 不同/);
  }
});

test('routes 缺少 path 时 name 备用，有动态 path 时禁止 name 兜底', () => {
  const local = source("{ name: 'group', meta: { local: true } }");
  const result = merge(local, source("{ name: 'group', children: [{ path: 'child' }] }"));
  assert.deepEqual(paths(property(array(result.content).elements[0], 'children')), ['child']);
  const dynamic = merge(local, source("{ path: getPath(), name: 'group', children: [{ path: 'bad' }] }"));
  assert.equal(dynamic.content, local);
  assert.match(dynamic.manual.join(), /动态 path/);
});

test('routes 同级匹配，不将不同父路由下相同子 path 误去重', () => {
  const result = merge(source("{ path: '/a', children: [{ path: 'same' }] }, { path: '/b', children: [] }"), source("{ path: '/b', children: [{ path: 'same' }] }"));
  assert.deepEqual(paths(property(array(result.content).elements[1], 'children')), ['same']);
});

test('routes 默认导出、const 别名链和 named export 别名静态解析', () => {
  const local = "const custom = [{ path: '/local' }]; const alias = custom; export default alias; export { custom as pages };";
  const target = "const next = [{ path: '/new' }]; export default next; export { next as pages };";
  const result = merge(local, target);
  assert.deepEqual(paths(array(result.content, 'custom')), ['/local', '/new']);
  assert.equal((result.content.match(/path: '\/new'/g) ?? []).length, 1);
});

test('routes 保留注释、CRLF、尾逗号、空 path 及模板字符串字面量', () => {
  const local = "// 本地\r\nexport const routes = [{ path: '' }, /* 尾部 */];\r\n";
  const result = merge(local, 'export const routes = [{ path: `` }, { path: `/new` }];');
  assert.deepEqual(paths(array(result.content)), ['', '/new']);
  assert.match(result.content, /\/\* 尾部 \*\//);
  assert.equal(result.content.replace(/\r\n/g, '').includes('\n'), false);
});

test('routes 新路由补齐 default、named、namespace 和 type-only 导入且保留动态 import', () => {
  const target = `import Layout from './layout'; import { Panel as Screen, unused } from './screen'; import * as views from './views'; import type { Props } from './types';
export const routes = [{ path: '/new', component: Layout, meta: { screen: Screen, fallback: views.Panel }, props: (value: Props) => value }, { path: '/lazy', component: async () => await import('./lazy.vue') }];`;
  const result = merge(source(''), target);
  semantic(result.content);
  assert.match(result.content, /import Layout from/);
  assert.match(result.content, /Panel as Screen/);
  assert.match(result.content, /import \* as views/);
  assert.match(result.content, /import type \{ Props \}/);
  assert.doesNotMatch(result.content, /unused/);
  assert.match(result.content, /async \(\) => await import\('\.\/lazy.vue'\)/);
});

test('routes 导入别名来源冲突只阻断相关项，保留本地绑定', () => {
  const local = `import { Old as View } from './old'; ${source("{ path: '/old', component: View }")}`;
  const target = `import { New as View } from './new'; ${source("{ path: '/bad', component: View }, { path: '/good' }")}`;
  const result = merge(local, target);
  assert.deepEqual(paths(array(result.content)), ['/old', '/good']);
  assert.match(result.manual.join(), /import View.*冲突/);
  assert.doesNotMatch(result.content, /from ['"]\.\/new/);
  semantic(result.content);
});

test('routes 已有节点的目标 import 冲突不能阻断安全子路由', () => {
  const local = `import View from './local'; ${source("{ path: '/a', component: View }")}`;
  const target = `import View from './target'; ${source("{ path: '/a', component: View, children: [{ path: 'new' }] }")}`;
  const result = merge(local, target);
  assert.deepEqual(paths(property(array(result.content).elements[0], 'children')), ['new']);
  assert.doesNotMatch(result.content, /\.\/target/);
});

test('routes 本地常量绑定冲突、type-only 值引用及未声明依赖安全阻断', () => {
  const cases = [
    ['const View = 1;', "import View from './view';", 'View'],
    ["import type { View } from './view';", "import { View } from './view';", 'View'],
    ['', "import type { View } from './view';", 'View'],
    ['const helper = 1;', 'const helper = makeHelper();', 'helper'],
    ['', '', 'missing'],
    ['const Math = 1;', '', 'Math'],
  ];
  for (const [head, imports, component] of cases) {
    const local = `${head} ${source('')}`;
    const result = merge(local, `${imports} ${source(`{ path: '/bad', component: ${component} }, { path: '/good' }`)}`);
    assert.deepEqual(paths(array(result.content)), ['/good']);
    assert.ok(result.manual.length);
  }
});

test('routes 回调参数和解构按作用域处理，不误判为模块依赖', () => {
  const result = merge(source(''), source("{ path: '/new', props: ({ params: renamed }) => { const id = renamed.id; return { id }; } }"));
  assert.deepEqual(paths(array(result.content)), ['/new']);
  assert.deepEqual(result.manual, []);
});

test('routes 不执行输入模块或动态表达式', () => {
  delete globalThis.__routesExecuted;
  const local = source('');
  const result = merge(local, "globalThis.__routesExecuted = true; export const routes = [{ path: (() => { throw new Error('禁止执行'); })() }];");
  assert.equal(result.content, local);
  assert.equal(globalThis.__routesExecuted, undefined);
  assert.match(result.manual.join(), /动态/);
});

for (const expression of ["{ ...base, path: '/a' }", "{ ['path']: '/a' }", "{ path: '/a', path: '/b' }", "{ path: getPath() }", "...extra", 'factory()', "{ path: '/a', name: Symbol() }"]) {
  test(`routes 本地不确定结构阻止潜在重复新增：${expression}`, () => {
    const local = source(expression);
    const result = merge(local, source("{ path: '/new' }"));
    assert.equal(result.content, local);
    assert.match(result.manual.join(), /动态|computed|spread/);
  });
}

test('routes 动态目标项转人工，独立静态项仍追加', () => {
  const result = merge(source(''), source("...unknown, { path: getPath() }, { path: '/safe' }"));
  assert.deepEqual(paths(array(result.content)), ['/safe']);
  assert.match(result.manual.join(), /动态/);
});

test('routes 动态 children 保留并提示，独立同级路由仍追加', () => {
  for (const [localChildren, targetChildren] of [["loadChildren()", "[{ path: 'new' }]"], ["[{ path: 'local' }]", "import.meta.glob('./*.ts')"]]) {
    const local = source(`{ path: '/a', children: ${localChildren} }`);
    const result = merge(local, source(`{ path: '/a', children: ${targetChildren} }, { path: '/safe' }`));
    assert.equal(property(array(result.content).elements[0], 'children').getText(), localChildren);
    assert.deepEqual(paths(array(result.content)), ['/a', '/safe']);
    assert.match(result.manual.join(), /动态 children/);
  }
});

test('routes 新增子树内的动态 children、computed 和重复 path 整项转人工', () => {
  for (const children of ["loadChildren()", "[{ ['path']: 'bad' }]", "[{ path: 'a' }, { path: 'a' }]", "[...extra]"]) {
    const result = merge(source(''), source(`{ path: '/bad', children: ${children} }, { path: '/safe' }`));
    assert.deepEqual(paths(array(result.content)), ['/safe']);
    assert.ok(result.manual.length);
  }
});

test('routes 同级重复 path/name 不猜测，已有子树不覆盖', () => {
  for (const duplicate of ["{ path: '/a' }, { path: '/a' }", "{ path: '/a', name: 'same' }, { path: '/b', name: 'same' }"]) {
    assert.equal(merge(source(duplicate), source("{ path: '/new' }")).content, source(duplicate));
    assert.equal(merge(source(''), source(duplicate)).content, source(''));
  }
});

test('routes 跨子树 name 冲突阻断整个新增子树，避免 Vue Router 替换本地路由', () => {
  const local = source("{ path: '/local', children: [{ path: 'child', name: 'reserved' }] }");
  const result = merge(local, source("{ path: '/new', children: [{ path: 'child', name: 'reserved' }] }, { path: '/safe' }"));
  assert.deepEqual(paths(array(result.content)), ['/local', '/safe']);
  assert.match(result.manual.join(), /reserved.*已存在/);
});

test('routes 数组运行时 push 和别名修改保留本地并提示', () => {
  for (const extra of ["routes.push({ path: '/new' });", "const alias = routes; alias.push({ path: '/new' });", "routes[0] = { path: '/new' };", "routes.length = 0;"]) {
    const local = `${source('')} ${extra}`;
    const result = merge(local, source("{ path: '/new' }"));
    assert.equal(result.content, local);
    assert.match(result.manual.join(), /运行时/);
  }
});

test('routes 真实 index.ts 增量 constantRoutes，不覆盖初始化、函数和 glob', () => {
  const original = fixture('index.ts');
  const local = original.replace('title: \'404页面\'', 'title: \'本地404\'').replace('return router;', 'return router; // 本地初始化');
  const target = original.replace('constantRoutes: RouteRecordRaw[] = [', "constantRoutes: RouteRecordRaw[] = [{ path: '/added', component: () => import('@/views/new.vue') },").replace('return router;', 'router.clearRoutes(); return router;');
  const result = merge(local, target, original);
  assert.deepEqual(paths(array(result.content, 'constantRoutes')), ['/page404', '/redirect/:path(.*)', '/:pathMatch(.*)*', '/added']);
  assert.match(result.content, /本地404|本地初始化/);
  assert.doesNotMatch(result.content, /clearRoutes/);
  assert.match(result.content, /import.meta.glob/);
  assert.match(result.manual.join(), /运行时/);
});

test('routes 真实 demo 嵌套缺失补齐，已有组件保持用户版本', () => {
  const original = fixture('routes/demo/001-demo.ts');
  const target = original.replace("path: '2-2'", "path: '2-3'");
  const local = original.replaceAll("@/views/demo.vue", '@/views/index/index.vue');
  const result = merge(local, target, target);
  assert.deepEqual(paths(property(array(result.content).elements[1], 'children')), ['2-1', '2-2', '2-3']);
  assert.equal((result.content.match(/@\/views\/index\/index.vue/g) ?? []).length, 5);
  assert.equal((result.content.match(/@\/views\/demo.vue/g) ?? []).length, 1);
});

test('routes 真实 PageEnum 动态路径保留；glob children 保留；插件运行时注册保留', () => {
  for (const path of ['routes/001-index.ts', 'routes/003-user.ts', 'routes/099-aon.ts']) {
    const original = fixture(path);
    const local = original + '\n// 用户定制';
    const result = merge(local, original.replace('title:', 'customTitle:'));
    assert.equal(result.content, local);
    assert.match(result.manual.join(), /动态|运行时/);
  }
  const original = fixture('routes/002-demo.ts');
  const local = original.replace('concatObjectValue<RouteRecordRaw>(import.meta.glob(\'./demo/*.ts\', { eager: true, import: \'routes\' }))', "[{ path: 'custom' }]");
  const result = merge(local, original);
  assert.equal(result.content, local);
  assert.match(result.manual.join(), /动态 children/);
});

test('routes 真实 guard 只保留本地函数并提示，不能套用 functions 覆盖', () => {
  const original = fixture('guard/index.ts');
  const local = original.replace('return true;', 'return false;');
  const result = merge(local, original, local);
  assert.equal(result.content, local);
  assert.match(result.manual.join(), /集成入口/);
});

test('routes web-meadmin 同形定制：首页 fullWidth 和重复 2-2 保留并提示', () => {
  const home = fixture('routes/001-index.ts');
  const customHome = home.replace("meta: { title: '首页' }", "meta: { title: '首页', fullWidth: true }");
  assert.equal(merge(customHome, home).content, customHome);
  const demo = fixture('routes/demo/001-demo.ts');
  const customDemo = demo.replace("path: '2-1'", "path: '2-2'").replaceAll('@/views/demo.vue', '@/views/index/index.vue');
  const result = merge(customDemo, demo);
  assert.equal(result.content, customDemo);
  assert.match(result.manual.join(), /重复/);
});

test('routes 带 satisfies/as 的运行时修改仍阻断，name-only 子路由参与全局冲突检查', () => {
  for (const suffix of ['as const', 'satisfies unknown[]']) {
    const local = `export const routes = [] ${suffix}; routes.push({ path: '/new' });`;
    const result = merge(local, source("{ path: '/new' }"));
    assert.equal(result.content, local);
    assert.match(result.manual.join(), /运行时/);
  }
  const local = source("{ path: '/a', children: [{ name: 'reserved' }] }");
  const result = merge(local, source("{ path: '/new', name: 'reserved' }"));
  assert.equal(result.content, local);
  assert.match(result.manual.join(), /reserved/);
});

test('routes 语法错误和缺少静态导出数组安全转人工', () => {
  for (const target of ['export const routes = [', 'export default createRoutes();', source("{ path: '/new' }")]) {
    const local = 'export default createLocalRouter();';
    const result = mergeSource(local, target, undefined, 'routes');
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
});

test('routes 配置默认覆盖 router 全目录，支持自定义路径、覆盖和禁用', () => {
  for (const path of ['index.ts', 'guard/index.ts', 'routes/demo/001-demo.ts']) assert.equal(sourceMode(`view/index/src/router/${path}`), 'routes');
  assert.equal(sourceMode('view/admin/src/router/index.ts'), undefined);
  assert.equal(sourceMode('view/index/src/router/index.ts', { 'view/index/src/router/index.ts': false }), false);
  assert.equal(sourceMode('view/index/src/router/routes/a.ts', { 'view/index/src/router/routes/**/*.ts': 'overwrite' }), 'overwrite');
  assert.equal(validateConfig({ mergeSource: { 'custom/**/*.ts': 'routes' } }).mergeSource['custom/**/*.ts'], 'routes');
});

test('routes planner 命中、同版本补齐、guard 不覆盖、新文件创建及重复幂等', t => {
  const directory = mkdtempSync(join(tmpdir(), 'meadmin-routes-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const roots = Object.fromEntries(['local', 'base', 'target'].map(name => [name, join(directory, name)]));
  for (const dir of Object.values(roots)) mkdirSync(dir);
  const put = (where, path, text) => { const file = join(roots[where], path); mkdirSync(join(file, '..'), { recursive: true }); writeFileSync(file, text); };
  const path = 'view/index/src/router/routes/demo/a.ts';
  put('local', path, source("{ path: '/a', meta: { local: true } }"));
  for (const where of ['base', 'target']) put(where, path, source("{ path: '/a', meta: { target: true }, children: [{ path: 'new' }] }"));
  const guard = 'view/index/src/router/guard/index.ts';
  put('local', guard, 'export function guard() { return true; }');
  put('target', guard, 'export function guard() { return false; }');
  const created = 'view/index/src/router/routes/new.ts';
  put('target', created, source("{ path: '/new' }"));
  const plan = () => makePlan(roots.local, roots.base, roots.target, '1.3.9', {});
  const result = plan();
  assert.equal(result.changes.find(item => item.path === path).action, 'merge');
  assert.equal(result.changes.find(item => item.path === created).action, 'create');
  assert.equal(result.changes.some(item => item.path === guard), false);
  assert.match(result.manual.join(), /guard.*人工/);
  for (const item of result.changes) put('local', item.path, item.content);
  assert.equal(plan().changes.length, 0);
  for (const mode of [false, 'overwrite']) assert.equal(makePlan(roots.local, roots.base, roots.target, '1.3.9', {}, { [path]: mode }).changes.find(item => item.path === path).action, 'overwrite');
  assert.equal(makePlan(roots.local, roots.base, roots.target, '1.3.9', { [path]: true }).changes.length, 0);
  const custom = 'src/config/custom-routes.ts';
  put('local', custom, source("{ path: '/local' }"));
  put('target', custom, source("{ path: '/new' }"));
  const configured = makePlan(roots.local, roots.base, roots.target, '1.3.9', {}, { [custom]: 'routes' });
  assert.deepEqual(paths(array(configured.changes.find(item => item.path === custom).content.toString())), ['/local', '/new']);
});
