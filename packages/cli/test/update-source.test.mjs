import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { mergeSource, isIntegrationSource } from '../dist/update/source.js';

function semantic(text, modules = {}) {
  const options = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, strict: true, experimentalDecorators: true, skipLibCheck: true };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile.bind(host);
  const files = new Map([['/virtual/source.ts', text], ...Object.entries(modules).map(([name, content]) => [`/virtual/${name.replace(/^\.\//, '').replace(/\.js$/, '.ts')}`, content])]);
  host.getSourceFile = (name, languageVersion, ...rest) => files.has(name) ? ts.createSourceFile(name, files.get(name), languageVersion, true) : original(name, languageVersion, ...rest);
  host.resolveModuleNames = names => names.map(name => {
    const resolvedFileName = `/virtual/${name.replace(/^\.\//, '').replace(/\.js$/, '.ts')}`;
    return files.has(resolvedFileName) ? { resolvedFileName, extension: ts.Extension.Ts } : undefined;
  });
  const program = ts.createProgram(['/virtual/source.ts'], options, host);
  const diagnostics = [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()];
  assert.deepEqual(diagnostics.map(item => `${item.code}: ${ts.flattenDiagnosticMessageText(item.messageText, '\n')}`), [], text);
  return program.getSourceFile('/virtual/source.ts');
}

function checked(local, target, base, mode = 'functions', modules = {}) {
  const result = mergeSource(local, target, base, mode);
  semantic(result.content, modules);
  const again = mergeSource(result.content, target, base, mode);
  assert.equal(again.content, result.content, `二次合并必须幂等\n${again.manual.join('\n')}`);
  assert.equal(again.changed, false);
  assert.equal(result.changed, result.content !== local);
  return result;
}

function evaluate(text, modules = {}) {
  const code = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const result = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    assert.ok(Object.hasOwn(modules, name), `缺少测试模块 ${name}`);
    return modules[name];
  }, result, result.exports);
  return result.exports;
}

const numberModule = 'export const a = 1; export const b = 2; export const c = 3; export default a; export type Shape = { value: number };';
const modules = { './a.js': numberModule, './b.js': numberModule, './other.js': numberModule };

test('函数基线按函数粒度判断，保留本地函数和注释', () => {
  const base = 'export function keep() { return 1; }\nexport function change() { return 0; }';
  const local = '// 本地说明\nexport function keep() { return 9; }\nexport function change() { return 3; }\nexport const localOnly = () => 7;';
  const target = 'export function keep() { return 1; }\nexport function change() { return 2; }\nexport const added = () => 4;';
  const result = checked(local, target, base);
  const output = evaluate(result.content);
  assert.equal(output.keep(), 9);
  assert.equal(output.change(), 2);
  assert.equal(output.localOnly(), 7);
  assert.equal(output.added(), 4);
  assert.ok(result.content.startsWith('// 本地说明\n'));
});

test('多变量声明逐个匹配 arrow/function，不覆盖同句常量和兄弟函数', () => {
  const base = 'export const a = () => 0, b = function () { return 1; }, constant = 5;';
  const local = 'export const a = () => 8, b = function () { return 9; }, constant = 20;';
  const target = 'export const a = () => 2, b = function () { return 1; }, added = () => 3, constant = 6;';
  const result = checked(local, target, base);
  const output = evaluate(result.content);
  assert.equal(output.a(), 2);
  assert.equal(output.b(), 9);
  assert.equal(output.added(), 3);
  assert.equal(output.constant, 20);
});

test('不同声明顺序及源码长度不会用错 SourceFile', () => {
  const base = 'export function a() { return 1; } export function b() { return 2; }';
  const local = '// 一段很长的本地说明，打乱节点坐标\nexport function b() { return 20; }\nexport function a() { return 10; }';
  const target = 'export function a() { return 1; }\nexport function b() { return 3; }';
  const output = evaluate(checked(local, target, base).content);
  assert.equal(output.a(), 10);
  assert.equal(output.b(), 3);
});

test('按导入符号追加，命名导出按导出名去重，保留本地混杂代码', () => {
  const local = `import { a } from './a.js';\nconst custom = 42;\nexport { a };\nexport { c as local } from './b.js';\nexport const localValue = custom;`;
  const target = `import { a, b } from './a.js';\nexport { a, b };\nexport * from './other.js';`;
  const result = checked(local, target, local, 'exports', modules);
  const output = evaluate(result.content, { './a.js': { a: 1, b: 2 }, './b.js': { c: 3 }, './other.js': { c: 4 } });
  assert.equal(output.a, 1);
  assert.equal(output.b, 2);
  assert.equal(output.local, 3);
  assert.equal(output.localValue, 42);
  assert.equal(output.c, 4);
});

test('named export 冲突保留本地，不生成重复导出', () => {
  const local = `export { a as same } from './a.js'; export * from './other.js';`;
  const target = `export { b as same, c as added } from './b.js'; export * from "./other.js"; export * from './other.js';`;
  const result = checked(local, target, local, 'exports', modules);
  const output = evaluate(result.content, { './a.js': { a: 10 }, './b.js': { b: 20, c: 30 }, './other.js': {} });
  assert.equal(output.same, 10);
  assert.equal(output.added, 30);
  assert.match(result.manual.join(), /冲突/);
  assert.equal(semantic(result.content, modules).statements.filter(ts.isExportDeclaration).filter(node => !node.exportClause).length, 1);
});

test('真实 filters 数组追加注册，保留本地项、顺序和其他代码', () => {
  const fixture = readFileSync(new URL('../../../src/filter/index.ts', import.meta.url), 'utf8');
  const fixtureAst = ts.createSourceFile('filter.ts', fixture, ts.ScriptTarget.Latest, true);
  const filterModules = Object.fromEntries(fixtureAst.statements.filter(ts.isImportDeclaration).map(node => [node.moduleSpecifier.text, `export class ${node.importClause.namedBindings.elements[0].name.text} {}`]));
  filterModules['./custom.js'] = 'export class CustomFilter {}';
  filterModules['./extra.js'] = 'export class ExtraFilter {}';
  const local = `import { CustomFilter } from './custom.js';\nconst localSetting = 1;\n${fixture.replace('filters = [', 'filters = [CustomFilter, ')}`;
  const target = `import { ExtraFilter } from './extra.js';\n${fixture.replace('filters = [', 'filters = [ExtraFilter, ')}`;
  assert.equal(isIntegrationSource(fixture), true);
  const result = checked(local, target, fixture, 'exports', filterModules);
  const ast = semantic(result.content, filterModules);
  const registry = ast.statements.filter(ts.isVariableStatement).flatMap(node => [...node.declarationList.declarations]).find(node => node.name.getText() === 'filters');
  assert.deepEqual(registry.initializer.elements.map(node => node.getText()), ['CustomFilter', 'DefaultErrorFilter', 'NotFoundFilter', 'UnauthorizedErrorFilter', 'ValidateErrorFilter', 'BadRequestFilter', 'ExtraFilter']);
  assert.ok(ast.statements.some(node => ts.isVariableStatement(node) && node.declarationList.declarations.some(item => item.name.getText() === 'localSetting')));
});

test('纯集成识别支持 default identifier/array，排除类、函数、动态注册和未使用变量', () => {
  assert.equal(isIntegrationSource(`import { a } from './a.js'; const registry = [a]; export default registry;`), true);
  assert.equal(isIntegrationSource(`import { a } from './a.js'; export default [a] as const;`), true);
  assert.equal(isIntegrationSource(`export * from './a.js';`), true);
  assert.equal(isIntegrationSource(`export const filters = makeFilters();`), false);
  assert.equal(isIntegrationSource(`const unused = []; export * from './a.js';`), false);
  assert.equal(isIntegrationSource(`export function f() { return 1; }`), false);
  assert.equal(isIntegrationSource(readFileSync(new URL('../../../src/decorators/index.ts', import.meta.url), 'utf8')), false);
  assert.equal(isIntegrationSource('export const = ['), false);
});

test('default identifier 解析本地和目标数组，追加且不覆盖本地声明', () => {
  const local = `import { a } from './a.js'; const custom = 7; const localFilters = [a, custom]; export default localFilters;`;
  const target = `import { a, b } from './a.js'; const filters = [a, b]; export default filters;`;
  const result = checked(local, target, local, 'exports', modules);
  assert.deepEqual(evaluate(result.content, { './a.js': { a: 1, b: 2 } }).default, [1, 7, 2]);
});

test('default 静态数组保留注释，处理尾逗号和重复项', () => {
  const local = `import { a } from './a.js'; export default [a, /* 本地注释 */] as const;`;
  const target = `import { a, b } from './a.js'; export default [a, b, b] as const;`;
  const result = checked(local, target, local, 'exports', modules);
  assert.deepEqual(evaluate(result.content, { './a.js': { a: 1, b: 2 } }).default, [1, 2]);
  assert.match(result.content, /本地注释/);
});

test('新增静态数组及 default identifier 支持 const 别名链', () => {
  const target = `import { a } from './a.js'; const original = [a]; const filters = original; export default filters;`;
  const result = checked('export const local = 1;', target, '', 'exports', modules);
  assert.deepEqual(evaluate(result.content, { './a.js': { a: 1 } }).default, [1]);
});

test('别名引用按导入来源去重注册，default/namespace/type-only 导入不重复绑定', () => {
  const local = `import value, { a as localA, type Shape } from './a.js'; import * as ns from './b.js'; export const filters = [localA]; export type LocalShape = Shape; export const n = ns.a + value;`;
  const target = `import value, { a as templateA, type Shape, b } from './a.js'; import * as ns from './b.js'; export const filters = [templateA, b];`;
  const result = checked(local, target, local, 'exports', modules);
  const output = evaluate(result.content, { './a.js': { a: 1, b: 2, default: 1 }, './b.js': { a: 1 } });
  assert.deepEqual(output.filters, [1, 2]);
});

test('导入别名冲突只阻断相关函数，不破坏本地引用', () => {
  const local = `import { a as dep } from './a.js'; export function f() { return dep; } export const local = dep;`;
  const target = `import { b as dep } from './b.js'; export function f() { return dep + 1; } export function good() { return 7; }`;
  const result = checked(local, target, local, 'functions', modules);
  const output = evaluate(result.content, { './a.js': { a: 3 } });
  assert.equal(output.f(), 3);
  assert.equal(output.local, 3);
  assert.equal(output.good(), 7);
  assert.match(result.manual.join(), /import dep.*冲突/);
});

test('type-only 本地导入不能静默变成值导入', () => {
  const typeModules = { './a.js': 'export class Thing { value = 1; }' };
  const local = `import type { Thing } from './a.js'; export function f(): number { return 0; } export type Local = Thing;`;
  const target = `import { Thing } from './a.js'; export function f(): number { return new Thing().value; }`;
  const result = checked(local, target, local, 'functions', typeModules);
  assert.equal(result.content, local);
  assert.match(result.manual.join(), /type-only 冲突/);
});

test('补函数必要导入，保留未使用目标导入不带入行为', () => {
  const local = 'export function f() { return 0; }';
  const target = `import { a, b } from './a.js'; export function f() { return a; }`;
  const result = checked(local, target, local, 'functions', modules);
  assert.equal(evaluate(result.content, { './a.js': { a: 5 } }).f(), 5);
  const ast = semantic(result.content, modules);
  const bindings = ast.statements.filter(ts.isImportDeclaration).flatMap(node => [...node.importClause.namedBindings.elements]);
  assert.deepEqual(bindings.map(node => node.name.text), ['a']);
});

test('目标新增常量、类型、类无法满足时阻断对应函数及依赖调用链', () => {
  const local = 'export function f() { return 10; }';
  const target = 'const missing = 5; type Added = number; class NewClass {} export function f(): Added { return missing; } export function bad() { return new NewClass(); } export function caller() { return bad(); } export function good() { return 2; }';
  const result = checked(local, target, local);
  const output = evaluate(result.content);
  assert.equal(output.f(), 10);
  assert.equal(output.good(), 2);
  assert.equal(output.bad, undefined);
  assert.equal(output.caller, undefined);
  assert.match(result.manual.join(), /missing/);
  assert.match(result.manual.join(), /Added/);
});

test('新增函数间依赖允许安全整组添加，包括递归', () => {
  const target = 'export function a(n: number): number { return n ? b(n - 1) : 1; } function b(n: number): number { return a(n); }';
  const result = checked('export const local = 1;', target, '');
  assert.equal(evaluate(result.content).a(2), 1);
});

test('参数、泛型、解构和 shorthand 按符号判断，不误认成外部依赖', () => {
  const target = 'export function f<T extends { value: number }>({ value: alias }: T) { const x = alias; return { x }; }';
  const result = checked('export const local = 1;', target, '');
  assert.deepEqual(evaluate(result.content).f({ value: 4 }), { x: 4 });
});

test('类分别匹配 getter/setter/static/method/arrow，保留字段和构造函数', () => {
  const base = `export class Demo { value = 0; constructor() { this.value = 0; } get item() { return this.value; } set item(v: number) { this.value = v; } static run() { return 0; } run() { return 0; } arrow = () => this.value; }`;
  const local = `export class Demo { value = 5; constructor() { this.value = 10; } get item() { return this.value + 10; } set item(v: number) { this.value = v * 10; } static run() { return 10; } run() { return 10; } arrow = () => this.value + 10; localOnly() { return 8; } }`;
  const target = `export class Demo { value = 100; constructor() { this.value = 100; } get item() { return this.value + 1; } set item(v: number) { this.value = v; } static run() { return 2; } run() { return 3; } arrow = () => this.value + 4; added() { return this.value + 5; } }`;
  const result = checked(local, target, base);
  const { Demo } = evaluate(result.content);
  const instance = new Demo();
  assert.equal(instance.value, 10);
  assert.equal(instance.item, 11);
  instance.item = 2;
  assert.equal(instance.value, 20);
  assert.equal(instance.run(), 3);
  assert.equal(Demo.run(), 2);
  assert.equal(instance.arrow(), 24);
  assert.equal(instance.added(), 25);
  assert.equal(instance.localOnly(), 8);
  assert.match(result.manual.join(), /构造函数/);
});

test('字段、参数属性、static/instance 和成员种类冲突安全阻断', () => {
  const local = 'export class Demo { value = 1; static shared = 2; constructor(public parameter = 3) {} f() { return 4; } }';
  const target = 'export class Demo { value() { return 5; } parameter() { return 6; } f() { return this.shared; } good() { return this.parameter; } }';
  const result = checked(local, target, local);
  const value = new (evaluate(result.content).Demo)();
  assert.equal(value.value, 1);
  assert.equal(value.parameter, 3);
  assert.equal(value.f(), 4);
  assert.equal(value.good(), 3);
  assert.match(result.manual.join(), /冲突/);
  assert.match(result.manual.join(), /this.shared/);
});

test('缺少 this 字段阻断普通、arrow 和新增方法，存在字段允许更新', () => {
  const local = 'export class Demo { existing = 1; f() { return 2; } arrow = () => 3; }';
  const target = `export class Demo { missing = 9; existing = 4; f() { return this.missing; } arrow = () => this.missing; added() { return this['missing']; } good() { return this.existing + 1; } }`;
  const result = checked(local, target, local);
  const value = new (evaluate(result.content).Demo)();
  assert.equal(value.f(), 2);
  assert.equal(value.arrow(), 3);
  assert.equal(value.good(), 2);
  assert.equal(value.added, undefined);
});

test('函数和类方法重载保留完整本地组并明确转人工', () => {
  const local = 'export function f(x: string): string; export function f(x: number): number; export function f(x: string | number) { return x; } export class Demo { run(x: string): string; run(x: number): number; run(x: string | number) { return x; } }';
  const target = 'export function f(x: string): string; export function f(x: string) { return x + "!"; } export class Demo { run(x: string): string; run(x: string) { return x + "!"; } good() { return 2; } }';
  const result = checked(local, target, local);
  const output = evaluate(result.content);
  assert.equal(output.f(4), 4);
  assert.equal(new output.Demo().run(5), 5);
  assert.equal(new output.Demo().good(), 2);
  assert.match(result.manual.join(), /重载组/);
});

test('类装饰器及字段不被整类覆盖，方法可局部替换', () => {
  const local = 'function decorate<T extends Function>(value: T): T { return value; } @decorate export class Demo { value = 5; f() { return 1; } }';
  const target = 'export class Demo { value = 10; f() { return 2; } }';
  const result = checked(local, target, local);
  const ast = semantic(result.content);
  const klass = ast.statements.find(ts.isClassDeclaration);
  assert.equal(ts.getDecorators(klass).length, 1);
  assert.equal(new (evaluate(result.content).Demo)().value, 5);
  assert.equal(new (evaluate(result.content).Demo)().f(), 2);
});

test('目标未改变的方法保留本地修改，类之间相同方法名互不干扰', () => {
  const base = 'export class A { run() { return 1; } } export class B { run() { return 2; } }';
  const local = 'export class B { run() { return 20; } } export class A { run() { return 10; } }';
  const target = 'export class A { run() { return 1; } } export class B { run() { return 3; } }';
  const output = evaluate(checked(local, target, base).content);
  assert.equal(new output.A().run(), 10);
  assert.equal(new output.B().run(), 3);
});

test('同名本地常量不可被新增函数重复绑定，独立函数照常添加', () => {
  const local = 'export const f = 10;';
  const target = 'export function f() { return 2; } export function good() { return 3; }';
  const output = evaluate(checked(local, target, '').content);
  assert.equal(output.f, 10);
  assert.equal(output.good(), 3);
});

test('缺少函数基线时不覆盖本地同名实现，新函数仍可添加', () => {
  const local = 'export function f() { return 8; }';
  const target = 'export function f() { return 2; } export function added() { return 3; }';
  for (const base of [undefined, '']) {
    const result = checked(local, target, base);
    assert.equal(evaluate(result.content).f(), 8);
    assert.equal(evaluate(result.content).added(), 3);
    assert.match(result.manual.join(), /基线/);
  }
});

test('独立 named export 注册数组仍追加已有导出名的注册项', () => {
  const local = `import { a } from './a.js'; const filters = [a]; export { filters };`;
  const target = `import { a, b } from './a.js'; const filters = [a, b]; export { filters };`;
  const result = checked(local, target, local, 'exports', modules);
  assert.deepEqual(evaluate(result.content, { './a.js': { a: 1, b: 2 } }).filters, [1, 2]);
});

test('新增 export const 注册数组对目标重复项去重', () => {
  const target = `import { a } from './a.js'; export const filters = [a, a];`;
  const result = checked('export const local = 7;', target, '', 'exports', modules);
  const output = evaluate(result.content, { './a.js': { a: 1 } });
  assert.deepEqual(output.filters, [1]);
  assert.equal(output.local, 7);
});

test('注册项 import 冲突仅跳过该项，安全项继续追加', () => {
  const local = `import { a as conflict } from './a.js'; export const filters = [conflict];`;
  const target = `import { b as conflict, c } from './b.js'; export const filters = [conflict, c];`;
  const result = checked(local, target, local, 'exports', modules);
  assert.deepEqual(evaluate(result.content, { './a.js': { a: 1 }, './b.js': { c: 3 } }).filters, [1, 3]);
  assert.match(result.manual.join(), /冲突/);
});

test('type-only 值使用阻断对应函数，但合法类型引用和其他函数仍合并', () => {
  const local = 'export function f() { return 0; }';
  const target = `import type { Thing } from './a.js'; export function f() { return new Thing(); } export function typed(value: Thing) { return value; } export function good() { return 3; }`;
  const result = checked(local, target, local, 'functions', { './a.js': 'export class Thing {}' });
  const output = evaluate(result.content);
  assert.equal(output.f(), 0);
  assert.equal(output.good(), 3);
  assert.equal(output.typed(7), 7);
  assert.match(result.manual.join(), /type-only/);
});

test('动态数组和 default 冲突保留本地，side-effect import 跨引号去重', () => {
  const local = `import './a.js'; const local = 1; export default local;`;
  const target = `import "./a.js"; import './a.js'; export default [2];`;
  const result = checked(local, target, local, 'exports', modules);
  assert.equal(evaluate(result.content, { './a.js': {} }).default, 1);
  assert.equal(semantic(result.content, modules).statements.filter(ts.isImportDeclaration).length, 1);
  assert.match(result.manual.join(), /default 导出冲突/);
});

test('类私有字段和泛型可安全引用，新增未声明字段仍阻断', () => {
  const local = 'export class Demo<T> { #value = 2; constructor(public value: T) {} getValue() { return this.#value; } }';
  const target = 'export class Demo<T> { #value = 3; constructor(public value: T) {} getValue() { return this.#value + 1; } identity(value: T): T { return value; } }';
  const result = checked(local, target, local);
  const value = new (evaluate(result.content).Demo)(5);
  assert.equal(value.getValue(), 3);
  assert.equal(value.identity(8), 8);
});

test('新增 default 数组去重，动态数组不合并且保留本地注册', () => {
  const added = checked('export const local = 1;', `import { a } from './a.js'; export default [a, a];`, '', 'exports', modules);
  assert.deepEqual(evaluate(added.content, { './a.js': { a: 2 } }).default, [2]);
  const local = 'const list = [1]; export const filters = [...list];';
  const result = checked(local, 'export const filters = [2];', local, 'exports');
  assert.deepEqual(evaluate(result.content).filters, [1]);
  assert.match(result.manual.join(), /动态数组/);
});

test('本地末尾无分号 arrow 字段与新方法安全分隔', () => {
  const local = 'export class Demo { arrow = () => 1 }';
  const target = 'export class Demo { arrow = () => 1; added() { return 2; } other() { return 3; } }';
  const result = checked(local, target, local);
  const value = new (evaluate(result.content).Demo)();
  assert.equal(value.arrow(), 1);
  assert.equal(value.added(), 2);
  assert.equal(value.other(), 3);
});

test('解析失败保留本地，changed 准确', () => {
  const result = mergeSource('export function {', 'export function added() {}', undefined, 'functions');
  assert.equal(result.content, 'export function {');
  assert.equal(result.changed, false);
  assert.match(result.manual.join(), /语法无效/);
  assert.equal(checked('export function f() { return 1; }', 'export function f() { return 1; }', undefined).changed, false);
});
