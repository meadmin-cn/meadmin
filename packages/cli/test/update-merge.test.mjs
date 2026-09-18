import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import { mergeConfig, mergeEntity, mergePackage } from '../dist/update/merge.js';

function syntax(content) {
  const file = ts.createSourceFile('merged.ts', content, ts.ScriptTarget.Latest, true);
  assert.deepEqual(file.parseDiagnostics.map(diagnostic => diagnostic.messageText), []);
  return file;
}

function object(content) {
  const file = syntax(content);
  let expression = file.statements.find(ts.isExportAssignment).expression;
  while (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression)) expression = expression.expression;
  return expression;
}

function properties(node) {
  return new Map(node.properties.map(property => [property.name.text, property.initializer]));
}

function fields(content, name = 'User') {
  return syntax(content).statements.find(statement => ts.isClassDeclaration(statement) && statement.name?.text === name).members;
}

test('package: 仅更新同组且基线发生变化的依赖，保留原始格式及元数据', () => {
  const local = '{\r\n  "name": "custom", "version": "9.0.0",\r\n  "scripts": {"dev": "custom"},\r\n  "dependencies": {"changed": "^1.0.0", "unchanged": "3.0.0", "local": "1.0.0"}\r\n}\r\n';
  const base = JSON.stringify({ dependencies: { changed: '^1.0.0', unchanged: '2.0.0' } });
  const target = JSON.stringify({ name: 'template', version: '10.0.0', dependencies: { changed: '^2.0.0', unchanged: '2.0.0', added: '^1.0.0' } });
  const result = mergePackage(local, target, base);
  const merged = JSON.parse(result.content);
  assert.equal(merged.dependencies.changed, '^2.0.0');
  assert.equal(merged.dependencies.added, '^1.0.0');
  assert.equal(merged.dependencies.unchanged, '3.0.0');
  assert.equal(merged.name, 'custom');
  assert.deepEqual(merged.scripts, { dev: 'custom' });
  assert.ok(result.content.includes('\r\n'));
  assert.deepEqual(result.manual, []);
});

test('package: 缺少依赖分组时创建，保留其他字段且可重复合并', () => {
  const local = '{ "name": "my-app", "scripts": {"dev":"custom"} }';
  const target = JSON.stringify({ dependencies: { a: '^1.0.0', b: '2.0.0' }, devDependencies: { tool: '~3.0.0' }, optionalDependencies: { opt: '1.0.0' }, peerDependencies: { peer: '^4.0.0' } });
  const result = mergePackage(local, target, local);
  const parsed = JSON.parse(result.content);
  assert.equal(parsed.dependencies.b, '2.0.0');
  assert.equal(parsed.devDependencies.tool, '~3.0.0');
  assert.equal(parsed.optionalDependencies.opt, '1.0.0');
  assert.equal(parsed.peerDependencies.peer, '^4.0.0');
  assert.equal(parsed.name, 'my-app');
  assert.deepEqual(result.manual, []);
  assert.equal(mergePackage(result.content, target, local).content, result.content);
});

test('package: 空依赖分组和连续新增保持合法JSON', () => {
  for (const local of ['{}', '{"dependencies":{}}', '{"dependencies":{"x":"1"}}']) {
    const result = mergePackage(local, '{"dependencies":{"a":"1","b":"2"}}', '{}');
    assert.equal(JSON.parse(result.content).dependencies.a, '1');
    assert.equal(JSON.parse(result.content).dependencies.b, '2');
  }
});

test('package: 无基线或基线缺少依赖不猜测版本', () => {
  for (const base of [undefined, '{}']) {
    const local = '{"dependencies":{"a":"1.0.0"}}';
    const result = mergePackage(local, '{"dependencies":{"a":"2.0.0"}}', base);
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
});

test('package: 同组双方修改版本时列出提示并采用目标版本', () => {
  const result = mergePackage('{"dependencies":{"a":"1.1.0"}}', '{"dependencies":{"a":"2.0.0"}}', '{"dependencies":{"a":"1.0.0"}}');
  assert.equal(JSON.parse(result.content).dependencies.a, '2.0.0');
  assert.match(result.manual.join(), /确认后采用目标版本/);
});

test('package: 支持四个依赖组及普通预发布版本', () => {
  const groups = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  const local = Object.fromEntries(groups.map((group, index) => [group, { [`dep${index}`]: '^1.0.0-beta.1' }]));
  const target = Object.fromEntries(groups.map((group, index) => [group, { [`dep${index}`]: '^2.0.0-rc.2' }]));
  const result = mergePackage(JSON.stringify(local), JSON.stringify(target), JSON.stringify(local));
  assert.deepEqual(JSON.parse(result.content), target);
  assert.deepEqual(result.manual, []);
});

test('package: 跨组、多组同名和特殊协议均转人工', () => {
  for (const version of ['workspace:*', 'file:../a', 'link:../a', 'npm:b@1', 'git+https://example.invalid/a', 'https://example.invalid/a.tgz', 'latest']) {
    const local = JSON.stringify({ dependencies: { a: '1.0.0' } });
    const result = mergePackage(local, JSON.stringify({ dependencies: { a: version } }), local);
    assert.equal(result.content, local);
    assert.match(result.manual.join('\n'), /特殊协议/);
  }
  for (const [local, target, base] of [
    [{ dependencies: { a: '1.0.0' } }, { devDependencies: { a: '2.0.0' } }, { dependencies: { a: '1.0.0' } }],
    [{ dependencies: { a: '1.0.0' }, peerDependencies: { a: '1.0.0' } }, { dependencies: { a: '2.0.0' } }, { dependencies: { a: '1.0.0' } }],
    [{ dependencies: { a: '1.0.0' } }, { dependencies: { a: '2.0.0' } }, { devDependencies: { a: '1.0.0' } }],
  ]) {
    const source = JSON.stringify(local);
    const result = mergePackage(source, JSON.stringify(target), JSON.stringify(base));
    assert.equal(result.content, source);
    assert.match(result.manual.join('\n'), /跨依赖组/);
  }
});

test('package: 非法 JSON、重复键和错误依赖结构保持原文', () => {
  for (const local of ['{', '[]', '{"dependencies":[]}', '{"dependencies":{"a":"1","a":"2"}}', '{"dependencies":{},"dependencies":{}}']) {
    const result = mergePackage(local, '{"dependencies":{"a":"3"}}', '{}');
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
});

test('config: 递归追加缺失键，保留数组和值以及源码注释', () => {
  const local = '// 自定义头部\nexport default {\n  nested: { a: 1 /* 保留 */ }, // 注释\n  list: [1, 2],\n  value: "local"\n};\n';
  const result = mergeConfig(local, 'export default { nested: { a: 2, b: true }, list: [3], value: "target", added: { enabled: true } };');
  const root = properties(object(result.content));
  assert.equal(root.get('list').getText(), '[1, 2]');
  assert.equal(root.get('value').getText(), '"local"');
  assert.equal(properties(root.get('nested')).get('a').getText(), '1');
  assert.equal(properties(root.get('nested')).get('b').getText(), 'true');
  assert.ok(root.has('added'));
  assert.match(result.content, /^\/\/ 自定义头部/);
  assert.match(result.content, /\/\* 保留 \*\//);
  assert.match(result.content, /\/\/ 注释/);
  assert.deepEqual(result.manual, []);
});

test('config: 支持括号、as 和 satisfies 外壳，保留 CRLF', () => {
  const local = 'type Shape = object;\r\nexport default ({ x: { a: 1 } as const } satisfies Shape);\r\n';
  const result = mergeConfig(local, 'export default ({ x: { b: 2 }, y: 3 } as const);');
  assert.equal(properties(object(result.content)).get('y').getText(), '3');
  assert.match(result.content, /satisfies Shape/);
  assert.equal(result.content.replaceAll('\r\n', '').includes('\n'), false);
  assert.deepEqual(result.manual, []);
});

test('config: 紧邻右花括号、空对象及尾逗号均正确插入', () => {
  for (const local of ['export default {}', 'export default {a:1}', 'export default {a:1,}', 'export default {a:1 // 尾注释\n}']) {
    const result = mergeConfig(local, 'export default {b:2,c:3}');
    const values = properties(object(result.content));
    assert.ok(values.has('b') && values.has('c'));
    assert.deepEqual(result.manual, []);
  }
});

test('config: 动态导出不执行，展开、计算键及复杂结构转人工', () => {
  globalThis.__updateMergeExecuted = false;
  for (const target of [
    'export default (() => { globalThis.__updateMergeExecuted = true; return {}; })()',
    'export default {...defaults}',
    'export default {[name]: 1}',
    'export default {run() {}}',
    'export default {a: 1, a: 2}',
    'export default {get a() {return 1}}',
  ]) {
    const local = 'export default {custom: true}';
    const result = mergeConfig(local, target);
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
  assert.equal(globalThis.__updateMergeExecuted, false);
  delete globalThis.__updateMergeExecuted;
});

test('config: 嵌套危险结构只阻止对应对象，安全兄弟键仍追加', () => {
  const result = mergeConfig('export default {nested: {...defaults}}', 'export default {nested: {a: 1}, safe: true, dynamic: call(), spread: [...items], mutate: counter++}');
  assert.match(result.content, /nested: \{\.\.\.defaults\}/);
  const values = properties(object(result.content));
  assert.ok(values.has('safe'));
  for (const name of ['dynamic', 'spread', 'mutate']) assert.equal(values.has(name), false);
  assert.equal(result.manual.length, 4);
});

test('config: 只补齐新增键需要的 import，并保持已有 import 原文', () => {
  const local = 'import { old } from "old"; // 已有导入\nexport default {keep: old};';
  const target = 'import { added as option, unused } from "settings"; export default {keep: unused, added: option};';
  const result = mergeConfig(local, target);
  assert.ok(result.content.includes('import { old } from "old";'));
  assert.match(result.content, /import \{ added as option \} from "settings";/);
  assert.doesNotMatch(result.content, /import.*unused/);
  assert.deepEqual(result.manual, []);
  syntax(result.content);
});

test('config: 未解析引用、目标私有变量及 import 冲突均不写入', () => {
  for (const [local, target] of [
    ['export default {}', 'export default {added: missing}'],
    ['export default {}', 'const value = 1; export default {added: value}'],
    ['const value = 1; export default {}', 'import {value} from "other"; export default {added: value}'],
    ['import {value} from "local"; export default {}', 'import {value} from "other"; export default {added: value}'],
    ['import type {Value} from "types"; export default {}', 'import {Value} from "types"; export default {added: Value}'],
    ['export default {}', 'import {Known} from "types"; export default {added: Known as Missing}'],
  ]) {
    const result = mergeConfig(local, target);
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
});

test('config: 可复用本地声明、同源 import；重复合并保持幂等', () => {
  const local = 'const value = 2; import {option} from "settings"; export default {}';
  const target = 'const value = 1; import {option} from "settings"; export default {added: value, option: option}';
  const result = mergeConfig(local, target);
  assert.deepEqual(result.manual, []);
  assert.equal((result.content.match(/from "settings"/g) ?? []).length, 1);
  assert.equal(mergeConfig(result.content, target).content, result.content);
});

test('entity: 按导出类名追加完整字段，已有字段原文不变', () => {
  const local = '// 自定义实体\nexport class User {\n  id: string = "local"; // 保留\n}\nexport class Other { own = true; }\n';
  const target = 'import {Column} from "orm"; import type {Value} from "types"; export class User { id: number = 2; @Column({nullable: true}) added!: Value; flag = true; } export class Other { count: number = 1; }';
  const result = mergeEntity(local, target);
  const members = fields(result.content);
  assert.equal(members[0].getText(), 'id: string = "local";');
  assert.match(members[1].getText(), /@Column\(\{nullable: true\}\) added!: Value;/);
  assert.equal(members[2].getText(), 'flag = true;');
  assert.equal(fields(result.content, 'Other').at(-1).name.text, 'count');
  assert.match(result.content, /import \{ Column \} from "orm";/);
  assert.match(result.content, /import type \{ Value \} from "types";/);
  assert.match(result.content, /\/\/ 自定义实体/);
  assert.match(result.content, /\/\/ 保留/);
  assert.deepEqual(result.manual, []);
  assert.equal(mergeEntity(result.content, target).content, result.content);
});

test('entity: 无分号字段和方括号数组类型边界不会误解析', () => {
  const result = mergeEntity('export class User { value = 1}', 'export class User { value = 2; next: string[] = [] }');
  assert.equal(fields(result.content).length, 2);
  assert.equal(fields(result.content)[0].initializer.getText(), '1');
});

test('entity: 支持默认及命名空间导入，只添加实际依赖', () => {
  const result = mergeEntity('export default class User {}', 'import Decorate from "decorator"; import * as Types from "types"; import {unused} from "unused"; export default class User { @Decorate() added!: Types.Value; }');
  assert.match(result.content, /import Decorate from "decorator";/);
  assert.match(result.content, /import \* as Types from "types";/);
  assert.doesNotMatch(result.content, /unused/);
  assert.deepEqual(result.manual, []);
  syntax(result.content);
});

test('entity: 方法、访问器及类装饰器变化转人工，安全字段照常追加', () => {
  const local = '@Table({name: "custom"}) export class User {}';
  const target = '@Table({name: "target"}) export class User { added = 1; run() {} get size() {return 1} accessor title = "x"; }';
  const result = mergeEntity(local, target);
  assert.match(result.content, /@Table\(\{name: "custom"\}\)/);
  assert.equal(fields(result.content).length, 1);
  assert.equal(fields(result.content)[0].name.text, 'added');
  assert.equal(result.manual.length, 4);
});

test('entity: 基线未修改的类装饰器不覆盖本地，也不重复提示', () => {
  const local = '@Table("local") export class User {}';
  const base = '@Table("base") export class User {}';
  const result = mergeEntity(local, '@Table("base") export class User { added = 1; }', base);
  assert.deepEqual(result.manual, []);
  assert.match(result.content, /@Table\("local"\)/);
});

test('entity: 目标新增类、本地成员类型冲突、计算键与重复字段转人工', () => {
  for (const [local, target] of [
    ['export class User {}', 'export class Other { value = 1; }'],
    ['export class User {value() {}}', 'export class User {value = 1;}'],
    ['export class User {}', 'export class User {[key] = 1;}'],
    ['export class User {}', 'export class User {value = 1; value = 2;}'],
    ['export class User {[key] = 1;}', 'export class User {value = 1;}'],
    ['export class User {}', 'export default class {value = 1;}'],
  ]) {
    const result = mergeEntity(local, target);
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
});

test('entity: 引用缺失时不追加字段且不留下部分 import', () => {
  for (const target of [
    'export class User {added = missing;}',
    'const seed = 1; export class User {added = seed;}',
    'import {Column} from "orm"; export class User {@Column() added: Missing = seed;}',
    'export class User<T> {added!: T;}',
    'export class User {added = this.absent;}',
    'export class User {added = {missing};}',
  ]) {
    const local = 'export class User {}';
    const result = mergeEntity(local, target);
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
});

test('entity: import 别名冲突和类型冲突拒绝写入，其他安全字段继续追加', () => {
  const local = 'import type {Column} from "orm"; export class User {}';
  const result = mergeEntity(local, 'import {Column} from "orm"; export class User {@Column() added = 1; safe = 2;}');
  assert.equal(fields(result.content).length, 1);
  assert.equal(fields(result.content)[0].name.text, 'safe');
  assert.match(result.manual.join('\n'), /冲突/);
});

test('entity: 字段内部箭头函数作用域可解析，外部缺失引用转人工', () => {
  const local = 'export class User {}';
  const target = 'export class User {fn = (value: number) => value + 1; bad = () => missing; }';
  const result = mergeEntity(local, target);
  assert.equal(fields(result.content).length, 1);
  assert.equal(fields(result.content)[0].name.text, 'fn');
  assert.match(result.manual.join('\n'), /missing/);
});

test('entity: 类泛型遮蔽导入、参数属性和静态字段冲突均转人工', () => {
  for (const [local, target] of [
    ['export class User<Value> {}', 'import {Value} from "types"; export class User<Value> {added = Value;}'],
    ['export class User {constructor(public value: number) {}}', 'export class User {value = 1;}'],
    ['export class User {static value = 1;}', 'export class User {value = 2;}'],
  ]) {
    const result = mergeEntity(local, target);
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
});

test('config: 目标本地变量不能被本地类型导入冒充', () => {
  const local = 'import type {value} from "types"; export default {}';
  const result = mergeConfig(local, 'const value = 1; export default {added: value}');
  assert.equal(result.content, local);
  assert.ok(result.manual.length);
});

test('config/entity: 非法语法保留本地，绝不回退整份替换', () => {
  for (const merge of [mergeConfig, mergeEntity]) {
    const local = '// 手工内容\nexport default {';
    const result = merge(local, 'export default {}');
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
});
