import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
import { mergeConfig, mergeEntity, mergePackage } from '../dist/update/merge.js';

test('entity: 追加Sequelize关联interface及import，保留本地声明并幂等', () => {
  const local = `import type { BelongsManyModel } from './types.js';\nimport type { SystemRole } from './role.js';\nexport class SystemAdmin {}\nexport declare interface SystemAdmin extends BelongsManyModel<'roles', 'role', 'roles', SystemRole> {}\n`;
  const target = `import type { BelongsManyModel } from './types.js';\nimport type { SystemOrganization } from './org.js';\nexport class SystemAdmin {}\nexport declare interface SystemAdmin extends BelongsManyModel<'organizations', 'organization', 'organizations', SystemOrganization> {}\n`;
  const result = mergeEntity(local, target, local);
  syntax(result.content);
  assert.match(result.content, /extends BelongsManyModel<'organizations', 'organization', 'organizations', SystemOrganization>/);
  assert.match(result.content, /extends BelongsManyModel<'roles'/);
  assert.match(result.content, /import type.*SystemOrganization/);
  assert.equal(mergeEntity(result.content, target, local).content, result.content);
  const doubleQuotes = target.replaceAll("'", '"');
  assert.equal(mergeEntity(result.content, doubleQuotes, local).content, result.content);
});

test('entity: interface导入冲突不生成悬空关联声明', () => {
 const local="import type { Link } from './custom'; export class User {}";
 const target="import type { Link } from './official'; export class User {} export declare interface User extends Link {}";
 const result=mergeEntity(local,target,local);
 assert.equal(result.content,local);assert.match(result.manual.join(),/冲突/);
});

test('entity: RuleType不同来源时仅为新增字段引入别名，不改本地字段', () => {
 const head="import { Attribute } from './attr'; import { DataTypes } from './data'; import { ApiPropertyRule } from './api';";
 const local=head+"import { RuleType } from '@midwayjs/validate'; export class SystemRole { @ApiPropertyRule({rule:RuleType.number()}) status: number; }";
 const field="@Attribute({comment:'数据权限:1=全部;2=组织;3=组织及以下;4=仅本人',defaultValue:3,allowNull:false,type:DataTypes.TINYINT.UNSIGNED}) @ApiPropertyRule({description:'数据权限',rule:RuleType.number().valid(1,2,3,4).default(3)}) dataScope: number;";
 const target=head+"import { RuleType } from '@/ruleType/index.js'; export class SystemRole { "+field+" }";
 const result=mergeEntity(local,target,local);
 syntax(result.content);
 assert.match(result.content,/RuleType as RuleTypeMeadmin/);
 assert.match(result.content,/rule:RuleTypeMeadmin.number\(\).valid\(1,2,3,4\).default\(3\)/);
 assert.match(result.content,/rule:RuleType.number\(\)\}\) status/);
 assert.match(result.content,/dataScope: number/);
 assert.deepEqual(result.manual,[]);
 assert.equal(mergeEntity(result.content,target,local).content,result.content);
});

test('entity: 既有字段更新装饰器及类型，回收无引用的 RuleType 并幂等', () => {
 const local = `import { RuleType } from '@midwayjs/validate'; import { ApiPropertyRule } from './api'; export class SystemRole { @ApiPropertyRule({rule: RuleType.number().default(1)}) dataScope?: string; custom = true; }`;
 const target = `import { RuleType } from '@/ruleType/index.js'; import { ApiPropertyRule } from './api'; export class SystemRole { @ApiPropertyRule({rule: RuleType.number().valid(1,2,3,4).default(3)}) dataScope: number; }`;
 const result = mergeEntity(local, target, target);
 syntax(result.content);
 assert.doesNotMatch(result.content, /@midwayjs\/validate|RuleTypeMeadmin/);
 assert.match(result.content, /import \{ RuleType \} from "@\/ruleType\/index.js"/);
 assert.match(result.content, /RuleType.number\(\).valid\(1,2,3,4\).default\(3\)/);
 assert.match(result.content, /dataScope: number/);
 assert.match(result.content, /custom = true/);
 assert.deepEqual(result.manual, []);
 assert.equal(mergeEntity(result.content, target, target).content, result.content);
});

const ruleTypeLocal = "import { RuleType } from '@midwayjs/validate';";
const ruleTypeTarget = "import { RuleType } from '@/ruleType/index.js';";

function importEntries(content, module) {
  return syntax(content).statements.filter(statement => ts.isImportDeclaration(statement) && statement.moduleSpecifier.text === module)
    .flatMap(statement => {
      const clause = statement.importClause;
      if (!clause) return [];
      const entries = clause.name ? [{ name: clause.name.text, imported: 'default', typeOnly: clause.isTypeOnly }] : [];
      if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) entries.push({ name: clause.namedBindings.name.text, imported: '*', typeOnly: clause.isTypeOnly });
      else for (const entry of clause.namedBindings?.elements ?? []) entries.push({ name: entry.name.text, imported: (entry.propertyName ?? entry.name).text, typeOnly: clause.isTypeOnly || entry.isTypeOnly });
      return entries;
    });
}

function ruleTypeMerge(local, target) {
  const result = mergeEntity(local, target);
  syntax(result.content);
  assert.deepEqual(result.manual, []);
  assert.deepEqual(mergeEntity(result.content, target), result);
  return result.content;
}

test('entity: RuleType 字段文本相同但来源不同仍替换绑定，单一导入删除且幂等', () => {
  const body = 'export class User { value = RuleType.number(); }';
  const content = ruleTypeMerge(ruleTypeLocal + body, ruleTypeTarget + body);
  assert.deepEqual(importEntries(content, '@midwayjs/validate'), []);
  assert.deepEqual(importEntries(content, '@/ruleType/index.js'), [{ name: 'RuleType', imported: 'RuleType', typeOnly: false }]);
  assert.equal(fields(content)[0].initializer.getText(), 'RuleType.number()');
});

test('entity: RuleType 混合导入只删旧绑定，保留 default、type-only、别名及尾逗号', () => {
  for (const [clause, expected] of [
    ['{ RuleType, Rule, type Shape }', ['Rule', 'Shape']],
    ['{ Rule, RuleType, type Shape }', ['Rule', 'Shape']],
    ['{ Rule, type Shape, RuleType, }', ['Rule', 'Shape']],
    ['Validator, { RuleType, Rule as Validate, type Shape }', ['Validator', 'Validate', 'Shape']],
    ['Validator, { RuleType, }', ['Validator']],
    ['type { RuleType, Shape }', ['Shape']],
    ['{ type RuleType, type Shape }', ['Shape']],
    ['type { RuleType }', []],
    ['RuleType, { Rule, type Shape }', ['Rule', 'Shape']],
    ['RuleType, * as Validate', ['Validate']],
    ['* as RuleType', []],
  ]) {
    const local = `import ${clause} from '@midwayjs/validate'; export class User { value!: RuleType; }`;
    const target = `${ruleTypeTarget} export class User { value = RuleType.number(); }`;
    const content = ruleTypeMerge(local, target);
    const entries = importEntries(content, '@midwayjs/validate');
    assert.deepEqual(entries.map(entry => entry.name), expected, clause);
    for (const entry of entries) {
      assert.equal(entry.typeOnly, entry.name === 'Shape', clause);
      if (entry.name === 'Validate') assert.ok(['Rule', '*'].includes(entry.imported));
      if (entry.name === 'Validator') assert.equal(entry.imported, 'default');
    }
    assert.equal(importEntries(content, '@/ruleType/index.js')[0].name, 'RuleType', clause);
  }
});

test('entity: RuleType 仍被本地字段、方法、类型、简写、计算键或导出使用时保留双导入', () => {
  for (const [member, outside] of [
    ['custom = RuleType.string();', ''],
    ['method() { return RuleType.number(); }', ''],
    ['custom!: RuleType;', ''],
    ['custom!: typeof RuleType;', ''],
    ['custom = { RuleType };', ''],
    ['custom = { [RuleType.key]: true };', ''],
    ['', 'type Custom = RuleType;'],
    ['', 'export { RuleType };'],
    ['', 'export { RuleType as LocalRule };'],
    ['', 'export default RuleType;'],
    ['', 'export declare interface User extends RuleType {}'],
  ]) {
    const local = `${ruleTypeLocal} export class User { value = RuleType.number(); ${member} } ${outside}`;
    const content = ruleTypeMerge(local, `${ruleTypeTarget} export class User { value = RuleType.string(); }`);
    assert.equal(importEntries(content, '@midwayjs/validate')[0].name, 'RuleType', member + outside);
    assert.equal(importEntries(content, '@/ruleType/index.js')[0].name, 'RuleTypeMeadmin', member + outside);
    assert.equal(fields(content)[0].initializer.getText(), 'RuleTypeMeadmin.string()');
    assert.ok(content.includes(member) && content.includes(outside));
  }
});

test('entity: RuleType 注释、字符串、属性键、成员访问和 shadow 变量不计作旧导入引用', () => {
  const custom = `// RuleType 和 RuleTypeMeadmin 保持原文
    text = 'RuleType RuleTypeMeadmin';
    object = { RuleType: 'RuleType', RuleTypeMeadmin: 'RuleTypeMeadmin' };
    RuleType = '属性';
    method(RuleType: { RuleType: string }) { return RuleType.RuleType; }
    shadow() { const RuleType = 1; return { RuleType }; }`;
  const outside = `type Other = { RuleType: string }; type Property = Other['RuleType'];
    namespace Names { export type RuleType = string; } type Nested = Names.RuleType;
    export { RuleType } from './unrelated';`;
  const local = `${ruleTypeLocal} export class User { value = RuleType.number(); ${custom} } ${outside}`;
  const content = ruleTypeMerge(local, `${ruleTypeTarget} export class User { value = RuleType.string(); }`);
  assert.deepEqual(importEntries(content, '@midwayjs/validate'), []);
  assert.equal(importEntries(content, '@/ruleType/index.js')[0].name, 'RuleType');
  assert.ok(content.includes(custom) && content.includes(outside));
});

test('entity: RuleType 目标绑定引用安全恢复，内部同名变量和属性键不改名', () => {
  const target = `${ruleTypeTarget} export class User {
    value = () => { const RuleTypeMeadmin = '局部'; const object = { RuleTypeMeadmin: '键' }; return [RuleType.number(), RuleTypeMeadmin, object.RuleTypeMeadmin]; };
  }`;
  const content = ruleTypeMerge(`${ruleTypeLocal} export class User { value = RuleType.string(); }`, target);
  assert.equal(importEntries(content, '@/ruleType/index.js')[0].name, 'RuleType');
  assert.match(content, /return \[RuleType.number\(\), RuleTypeMeadmin, object.RuleTypeMeadmin\]/);
  assert.match(content, /const RuleTypeMeadmin = '局部'/);
  assert.match(content, /\{ RuleTypeMeadmin: '键' \}/);
});

test('entity: RuleType 回收会被字段内部参数或类型参数捕获时保守保留别名', () => {
  for (const [expression, expected] of [
    ['(RuleType: unknown) => null as RuleType', '(RuleType: unknown) => null as RuleTypeMeadmin'],
    ['<RuleType>() => RuleType.number()', '<RuleType>() => RuleTypeMeadmin.number()'],
  ]) {
    const target = `${ruleTypeTarget} export class User { value = ${expression}; }`;
    const local = `${ruleTypeLocal} export class User { value = RuleType.string(); }`;
    const content = ruleTypeMerge(local, target);
    assert.equal(importEntries(content, '@/ruleType/index.js')[0].name, 'RuleTypeMeadmin');
    assert.equal(importEntries(content, '@midwayjs/validate')[0].name, 'RuleType');
    assert.equal(fields(content)[0].initializer.getText(), expected);
  }
});

test('entity: RuleType 目标简写属性保留属性键，回收别名后重复合并幂等', () => {
  const local = `${ruleTypeLocal} export class User { value = RuleType.number(); }`;
  const target = `${ruleTypeTarget} export class User { value = { RuleType }; }`;
  const content = ruleTypeMerge(local, target);
  assert.equal(fields(content)[0].initializer.getText(), '{ RuleType: RuleType }');
  assert.equal(importEntries(content, '@/ruleType/index.js')[0].name, 'RuleType');
});

test('entity: RuleType 多个字段替换并追加，别名复用后一次恢复全部引用', () => {
  const local = `${ruleTypeLocal} export class User { first = RuleType.number(); second = RuleType.number(); }`;
  const target = `${ruleTypeTarget} export class User { first = RuleType.string(); second = RuleType.boolean(); third = RuleType.number(); }`;
  const content = ruleTypeMerge(local, target);
  assert.deepEqual(importEntries(content, '@midwayjs/validate'), []);
  assert.deepEqual(importEntries(content, '@/ruleType/index.js'), [{ name: 'RuleType', imported: 'RuleType', typeOnly: false }]);
  assert.deepEqual(fields(content).map(field => field.initializer.getText()), ['RuleType.string()', 'RuleType.boolean()', 'RuleType.number()']);
});

test('entity: RuleType type-only 目标和 default、namespace 目标均安全恢复', () => {
  for (const [targetImport, field, imported, typeOnly] of [
    ["import type { RuleType } from '@/ruleType/index.js';", 'value!: RuleType;', 'RuleType', true],
    ["import RuleType from '@/ruleType/index.js';", 'value = RuleType.number();', 'default', false],
    ["import * as RuleType from '@/ruleType/index.js';", 'value = RuleType.number();', '*', false],
  ]) {
    const content = ruleTypeMerge(`${ruleTypeLocal} export class User { value = RuleType.string(); }`, `${targetImport} export class User { ${field} }`);
    assert.deepEqual(importEntries(content, '@midwayjs/validate'), []);
    assert.deepEqual(importEntries(content, '@/ruleType/index.js'), [{ name: 'RuleType', imported, typeOnly }]);
  }
});

test('entity: RuleType 已存在用户别名（含 Meadmin 后缀）不会被任意重命名', () => {
  for (const alias of ['CustomRule', 'RuleTypeMeadmin']) {
    const local = `${ruleTypeLocal} import { RuleType as ${alias} } from '@/ruleType/index.js'; export class User { value = RuleType.number(); }`;
    const content = ruleTypeMerge(local, `${ruleTypeTarget} export class User { value = RuleType.string(); }`);
    assert.equal(importEntries(content, '@/ruleType/index.js')[0].name, alias);
    assert.equal(fields(content)[0].initializer.getText(), `${alias}.string()`);
  }
});

test('entity: RuleType 两个目标来源均导出同名符号时不会混淆绑定，重复合并幂等', () => {
  const local = `${ruleTypeLocal} import { RuleType as OtherRule } from './local-other'; export class User { first = RuleType.number(); second = OtherRule.number(); }`;
  const target = `${ruleTypeTarget} import { RuleType as OtherRule } from './target-other'; export class User { first = RuleType.string(); second = OtherRule.string(); }`;
  const content = ruleTypeMerge(local, target);
  assert.deepEqual(importEntries(content, '@midwayjs/validate'), []);
  assert.deepEqual(importEntries(content, './local-other'), []);
  assert.equal(importEntries(content, '@/ruleType/index.js')[0].name, 'RuleType');
  assert.equal(importEntries(content, './target-other')[0].name, 'OtherRule');
  assert.equal(fields(content)[0].initializer.getText(), 'RuleType.string()');
  assert.equal(fields(content)[1].initializer.getText(), 'OtherRule.string()');
});

test('entity: RuleType 生成别名避开第二目标来源的导入名，回收后不串来源', () => {
  const local = `${ruleTypeLocal} export class User { first = RuleType.number(); }`;
  const target = `${ruleTypeTarget} import { RuleType as RuleTypeMeadmin } from './second-target'; export class User { first = RuleType.string(); second = RuleTypeMeadmin.number(); }`;
  const content = ruleTypeMerge(local, target);
  assert.deepEqual(importEntries(content, '@midwayjs/validate'), []);
  assert.equal(importEntries(content, '@/ruleType/index.js')[0].name, 'RuleType');
  assert.equal(importEntries(content, './second-target')[0].name, 'RuleTypeMeadmin');
  assert.deepEqual(fields(content).map(field => field.initializer.getText()), ['RuleType.string()', 'RuleTypeMeadmin.number()']);
});

test('entity: RuleType interface 追加产生的旧绑定引用也纳入最终分析', () => {
  const local = `${ruleTypeLocal} export class User { value = RuleType.number(); }`;
  const target = `${ruleTypeLocal} import { RuleType as NewRule } from '@/ruleType/index.js'; export class User { value = NewRule.string(); } export declare interface User extends RuleType {}`;
  const content = ruleTypeMerge(local, target);
  assert.equal(importEntries(content, '@midwayjs/validate')[0].name, 'RuleType');
  assert.match(content, /interface User extends RuleType/);
});

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

test('package: 同组普通依赖按目标更新且不要求基线变化，保留原始格式及元数据', () => {
  const local = '{\r\n  "name": "custom", "version": "9.0.0",\r\n  "scripts": {"dev": "custom"},\r\n  "dependencies": {"changed": "^1.0.0", "unchanged": "3.0.0", "local": "1.0.0"}\r\n}\r\n';
  const base = JSON.stringify({ dependencies: { changed: '^1.0.0', unchanged: '2.0.0' } });
  const target = JSON.stringify({ name: 'template', version: '10.0.0', dependencies: { changed: '^2.0.0', unchanged: '2.0.0', added: '^1.0.0' } });
  const result = mergePackage(local, target, base);
  const merged = JSON.parse(result.content);
  assert.equal(merged.dependencies.changed, '^2.0.0');
  assert.equal(merged.dependencies.added, '^1.0.0');
  assert.equal(merged.dependencies.unchanged, '2.0.0');
  assert.equal(merged.name, 'custom');
  assert.deepEqual(merged.scripts, { dev: 'custom' });
  assert.ok(result.content.includes('\r\n'));
  assert.match(result.manual.join(), /unchanged/);
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

test('package: 无基线或基线缺少依赖也按明确目标声明更新', () => {
  for (const base of [undefined, '{}']) {
    const local = '{"dependencies":{"a":"1.0.0"}}';
    const result = mergePackage(local, '{"dependencies":{"a":"2.0.0"}}', base);
    assert.equal(JSON.parse(result.content).dependencies.a, '2.0.0');
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

const bullmq = `bullmq: {
  defaultConnection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASS,
    db: process.env.REDIS_MQ ?? 1,
  },
  defaultPrefix: '[meadmin-bullmq]',
  clearRepeatJobWhenStart: false,
}`;

const bullmqTarget = `export default { ${bullmq} };`;

test('config: 精确 bullmq 整块原样追加 process.env 与 ??，不读取环境且幂等', () => {
  const local = '// 合成本地配置\nexport default { custom: true, list: ["local"] };';
  const environment = process.env;
  let result;
  try {
    process.env = new Proxy(environment, {
      get(target, name) {
        if (typeof name === 'string' && /^REDIS_/.test(name)) throw new Error('不得读取配置环境变量');
        return Reflect.get(target, name);
      },
    });
    result = mergeConfig(local, bullmqTarget);
  } finally {
    process.env = environment;
  }
  const root = properties(object(result.content));
  assert.equal(root.get('bullmq').parent.getText(), bullmq);
  assert.equal(root.get('custom').getText(), 'true');
  assert.equal(root.get('list').getText(), '["local"]');
  assert.deepEqual(result.manual, []);
  assert.deepEqual(mergeConfig(result.content, bullmqTarget), result);
});

test('config: bullmq 嵌套缺失对象和叶子只增，既有连接值与注释保留', () => {
  for (const local of [
    'export default { bullmq: { defaultPrefix: "local-prefix" } };',
    'export default { bullmq: { defaultConnection: { host: "fixture-host" /* 本地注释 */, db: 9 }, defaultPrefix: "local-prefix" } };',
  ]) {
    const result = mergeConfig(local, bullmqTarget);
    const queue = properties(properties(object(result.content)).get('bullmq'));
    const connection = properties(queue.get('defaultConnection'));
    assert.equal(queue.get('defaultPrefix').getText(), '"local-prefix"');
    assert.equal(queue.get('clearRepeatJobWhenStart').getText(), 'false');
    assert.equal(connection.get('port').getText(), 'process.env.REDIS_PORT');
    assert.equal(connection.get('password').getText(), 'process.env.REDIS_PASS');
    assert.equal(connection.get('host').getText(), local.includes('fixture-host') ? '"fixture-host"' : 'process.env.REDIS_HOST');
    assert.equal(connection.get('db').getText(), local.includes('fixture-host') ? '9' : 'process.env.REDIS_MQ ?? 1');
    if (local.includes('fixture-host')) assert.match(result.content, /\/\* 本地注释 \*\//);
    assert.deepEqual(result.manual, []);
    assert.deepEqual(mergeConfig(result.content, bullmqTarget), result);
  }
});

test('config: 完整本地 bullmq、数组及数组内对象逐字保留', () => {
  const local = `export default {
    bullmq: { defaultConnection: { host: 'fixture-host', port: 6380, password: 'fixture-only', db: process.env.LOCAL_MQ ?? 9 }, defaultPrefix: 'local', clearRepeatJobWhenStart: true },
    list: [{ local: true }],
  };`;
  const result = mergeConfig(local, `export default { ${bullmq}, list: [{ added: process.env.REDIS_MQ ?? 1 }] };`);
  assert.equal(result.content, local);
  assert.deepEqual(result.manual, []);
});

test('config: ?? 不放宽未知依赖、调用、赋值或不安全对象，仅追加安全兄弟键', () => {
  for (const value of [
    'process.env.REDIS_MQ ?? missing',
    'missing.env.REDIS_MQ ?? 1',
    'process.env.REDIS_MQ ?? call()',
    'process.env.REDIS_MQ ?? (counter = 1)',
    'process.env.REDIS_MQ ?? {...defaults}',
    'process.env.REDIS_MQ ?? {__proto__: {}}',
    'process.cwd',
    'process',
  ]) {
    const result = mergeConfig('export default {}', `export default { bullmq: { db: ${value} }, safe: true }`);
    const root = properties(object(result.content));
    assert.equal(root.has('bullmq'), false, value);
    assert.equal(root.get('safe').getText(), 'true');
    assert.equal(result.manual.length, 1);
    assert.match(result.manual[0], /config.bullmq:/);
  }
});

test('config: process 被本地声明或导入遮蔽时整块转人工且不留下 import', () => {
  for (const prefix of [
    'const process = { env: {} };',
    'import process from "custom-process";',
    'import type { process } from "custom-process";',
  ]) {
    const local = `${prefix} export default {};`;
    const result = mergeConfig(local, bullmqTarget);
    assert.equal(result.content, local);
    assert.match(result.manual.join(), /config.bullmq:.*process/);
  }
  const result = mergeConfig('export default {}', `import { option } from 'settings'; export default { bullmq: { option: option, db: process.env.REDIS_MQ ?? missing } };`);
  assert.equal(result.content, 'export default {}');
  assert.match(result.manual.join(), /missing/);
});

test('config: import 冲突只阻止对应新增项，环境配置仍合并', () => {
  const local = 'import { option } from "local"; export default {};';
  const result = mergeConfig(local, `import { option } from "target"; export default { ${bullmq}, other: { value: option ?? 1 } };`);
  const root = properties(object(result.content));
  assert.equal(root.get('bullmq').parent.getText(), bullmq);
  assert.equal(root.has('other'), false);
  assert.match(result.manual.join(), /config.other:.*冲突/);
  assert.doesNotMatch(result.content, /from "target"/);
});

test('config: 未知 defineConfig 与函数导出仍不执行且转人工', () => {
  for (const target of [
    `export default defineConfig({ ${bullmq} });`,
    `export default () => ({ ${bullmq} });`,
  ]) {
    const local = 'export default {}';
    const result = mergeConfig(local, target);
    assert.equal(result.content, local);
    assert.ok(result.manual.length);
  }
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

test('entity: 同名字段按目标更新，本地独有字段不删除', () => {
  const local = '// 自定义实体\nexport class User {\n  id: string = "local"; // 保留\n}\nexport class Other { own = true; }\n';
  const target = 'import {Column} from "orm"; import type {Value} from "types"; export class User { id: number = 2; @Column({nullable: true}) added!: Value; flag = true; } export class Other { count: number = 1; }';
  const result = mergeEntity(local, target);
  const members = fields(result.content);
  assert.equal(members[0].getText(), 'id: number = 2;');
  assert.equal(fields(result.content, 'Other')[0].name.text, 'own');
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
  assert.equal(fields(result.content)[0].initializer.getText(), '2');
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

test('entity: 旧目标相同或旧语法无效时仍提示类头差异并更新同名字段', () => {
  const local = '@Table("local") export class User<T> { value = 10; localOnly = 20; run() { return 30; } }';
  const target = '@Table("target") export class User { value = 1; added = 2; run() { return 3; } }';
  for (const base of [target, undefined, '', 'export class {']) {
    const result = mergeEntity(local, target, base);
    assert.match(result.manual.join(), /类装饰器、修饰器、继承或类型参数/);
    assert.match(result.manual.join(), /方法、访问器或复杂成员/);
    assert.match(result.content, /@Table\("local"\)/);
    assert.match(result.content, /class User<T>/);
    assert.match(result.content, /value = 1;/);
    assert.match(result.content, /added = 2;/);
    assert.match(result.content, /localOnly = 20;/);
    assert.match(result.content, /return 30/);
    assert.deepEqual(result, mergeEntity(local, target));
    assert.equal(mergeEntity(result.content, target, base).content, result.content);
  }
  assert.deepEqual(mergeEntity(target, target, 'export class {').manual, []);
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

test('entity: 仍被类型引用的 type-only 导入保留并为新增装饰器补运行时别名', () => {
  const local = 'import type {Column} from "orm"; type LocalColumn = Column; export class User {}';
  const result = mergeEntity(local, 'import {Column} from "orm"; export class User {@Column() added = 1; safe = 2;}');
  assert.equal(fields(result.content).length, 2);
  assert.match(result.content, /Column as ColumnMeadmin/);
  assert.match(result.content, /@ColumnMeadmin\(\)/);
  assert.deepEqual(result.manual, []);
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
