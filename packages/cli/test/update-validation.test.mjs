import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { mergeSource } from '../dist/update/source.js';

const fixture = readFileSync(new URL('../../../src/ruleType/string.ts', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const base = fixture.replace(/  \/\*\*\n   \* 校验是否是正确的手机号或座机号[\s\S]*?  phone\(\): this;\n/, '').replace(/      'string.phone':[^\n]*\n/, '').replace(/      phone:\{[\s\S]*?\n      \}/, '');
const local = base.replace('mobile(): this;', 'mobile(legacy?: boolean): this;\n  custom(): this;\n  localValue?: string;').replace("'string.mobile': '{{#label}} must be a true mobile',", "'string.mobile': 'local mobile',\n      'string.custom': 'custom message',").replace('rules: {', 'rules: {\n      custom: { validate(value) { return `custom:${value}`; } },').replace("helpers.error('string.mobile')", "helpers.error('local.mobile')").replace("type: 'string',", "type: 'string',\n    coerce(value) { return { value: value.trim() }; },").replace('base: root.string(),', 'base: root.string().trim(),').replace('  return customRuleType.extend', '  localCalls++;\n  return customRuleType.extend') + '\nexport let localCalls = 0;\nexport const untouched = () => "local";\n';

function evaluate(text, modules = {}) {
  const code = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const output = { exports: {} };
  new Function('require', 'module', 'exports', code)(name => {
    assert.ok(Object.hasOwn(modules, name), name);
    return modules[name];
  }, output, output.exports);
  return output.exports;
}

function checked(current, target = fixture, baseline = base) {
  const result = mergeSource(current, target, baseline, 'validation', 'src/ruleType/string.ts');
  assert.deepEqual(result.manual, []);
  const again = mergeSource(result.content, target, baseline, 'validation');
  assert.equal(again.content, result.content);
  assert.equal(again.changed, false);
  assert.deepEqual(again.manual, []);
  return result;
}

function semantic(text, modules = {}) {
  const definitions = `export namespace RuleType {
    export interface StringSchema<T = string> { trim(): this; validate(value: unknown): T; }
    export interface Root { string(): StringSchema; extend(callback: (root: Root) => { type: string; base: StringSchema; messages?: Record<string, string>; rules: Record<string, { validate(value: string, helpers: { error(code: string): string }): string }>; coerce?(value: string): { value: string } }): Root; }
  }`;
  const files = new Map([['/virtual/source.ts', text], ['/virtual/validate.ts', definitions], ...Object.entries(modules).map(([name, value]) => [`/virtual/${name}`, value])]);
  const options = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, skipLibCheck: true };
  const host = ts.createCompilerHost(options), original = host.getSourceFile.bind(host);
  host.getSourceFile = (name, version, ...rest) => files.has(name) ? ts.createSourceFile(name, files.get(name), version, true) : original(name, version, ...rest);
  host.resolveModuleNames = names => names.map(name => ({ resolvedFileName: name === '@midwayjs/validate' ? '/virtual/validate.ts' : `/virtual/${name.replace('./', '').replace('.js', '.ts')}`, extension: ts.Extension.Ts }));
  const program = ts.createProgram(['/virtual/source.ts'], options, host);
  assert.deepEqual(ts.getPreEmitDiagnostics(program).map(item => `${item.code}: ${ts.flattenDiagnosticMessageText(item.messageText, '\n')}`), [], text);
}

test('真实 mobile/phone/custom 三方合并，覆盖同名完整规则和接口，保留本地执行逻辑', () => {
  assert.doesNotMatch(base, /phone/);
  const result = checked(local);
  assert.equal(result.changed, true);
  semantic(result.content + '\ndeclare const schema: CustomStringSchema; schema.mobile().phone().custom();');
  const output = evaluate(result.content);
  const root = { string: () => ({ trim: () => 'local base' }), extend: callback => callback(root) };
  const extension = output.initRuleType(root);
  assert.equal(output.localCalls, 1);
  assert.equal(output.untouched(), 'local');
  assert.equal(extension.base, 'local base');
  assert.equal(extension.type, 'string');
  assert.deepEqual(extension.coerce(' value '), { value: 'value' });
  assert.deepEqual(Object.keys(extension.rules).sort(), ['custom', 'mobile', 'phone']);
  const helpers = { error: code => code };
  assert.equal(extension.rules.mobile.validate('bad', helpers), 'string.mobile');
  assert.equal(extension.rules.phone.validate('010-12345678', helpers), '010-12345678');
  assert.equal(extension.rules.phone.validate('bad', helpers), 'string.phone');
  assert.equal(extension.rules.custom.validate('ok'), 'custom:ok');
  assert.equal(extension.messages['string.custom'], 'custom message');
  assert.equal(extension.messages['string.mobile'], '{{#label}} must be a true mobile');
  assert.ok(extension.messages['string.phone']);
  assert.doesNotMatch(result.content, /legacy|local.mobile/);
  assert.match(result.content, /localValue\?: string/);
});

test('目标与基线相同仍覆盖同名规则，缺少基线也按名字合并', () => {
  for (const baseline of [fixture, undefined]) {
    const result = mergeSource(local, fixture, baseline, 'validation');
    assert.deepEqual(result.manual, []);
    assert.match(result.content, /phone\(\): this/);
    assert.doesNotMatch(result.content, /local.mobile/);
  }
});

test('表达式函数、回调 block return、CRLF 与接口泛型方法均支持', () => {
  const concise = fixture.replace('=> {\n  return customRuleType.extend', '=> customRuleType.extend').replace(/;\n\};\s*$/, ';');
  const generic = concise.replace('mobile(): this;', 'mobile(value?: TSchema): this;');
  const result = checked(concise.replace(/\n/g, '\r\n'), generic);
  semantic(result.content);
  const callback = fixture.replace('(root) => ({', '(root) => { return ({').replace('  })) as {', '  }); }) as {');
  semantic(checked(callback, callback.replace('mobile(): this;', 'mobile(value?: TSchema): this;')).content);
});

test('必要导入安全追加，类型导入保留，目标无关导入和导出不带入', () => {
  const target = `import { normalize, unused } from './helper.js';\nimport type { Options } from './types.js';\nexport { other } from './other.js';\n` + fixture.replace('mobile(): this;', 'mobile(options?: Options): this;').replace('return value;', 'return normalize(value);');
  const current = local + "\nimport { localUnused } from './local.js';\n";
  const result = checked(current, target);
  assert.match(result.content, /import \{ normalize \} from "\.\/helper.js"/);
  assert.match(result.content, /import type \{ Options \} from "\.\/types.js"/);
  assert.match(result.content, /localUnused/);
  assert.doesNotMatch(result.content, /other.js|normalize, unused/);
  semantic(result.content, { 'helper.ts': 'export const normalize = (value: string) => value;', 'types.ts': 'export type Options = { enabled: boolean };', 'local.ts': 'export const localUnused = 1;' });
});

test('缺少 messages 时安全追加，按键覆盖并保留本地其它消息', () => {
  const current = base.replace(/    messages: \{[\s\S]*?\n    \},\n/, '');
  semantic(checked(current).content);
});

test('同名规则整个替换，不残留旧 validate 或旧属性', () => {
  const current = fixture.replace('mobile: {', "mobile: { localFlag: true, oldMethod() { return 'old'; },");
  const result = checked(current);
  assert.doesNotMatch(result.content, /localFlag|oldMethod/);
});

test('接口重载按方法名完整替换，本地无分号方法与新增方法安全分隔', () => {
  const current = base.replace('mobile(): this;', 'mobile(value: string): this; mobile(value: number): this; custom(): this');
  const result = checked(current);
  semantic(result.content);
  assert.equal((result.content.match(/mobile\(/g) ?? []).length, 1);
  assert.match(result.content, /custom\(\): this;/);
});

const unsafe = [
  ['动态 rules 键', text => text.replace('mobile: {', '[ruleName]: {')],
  ['动态 messages 键', text => text.replace("'string.mobile':", '[messageName]:')],
  ['规则引用', text => text.replace('rules: {', 'rules: ruleMap || {')],
  ['消息引用', text => text.replace('messages: {', 'messages: messageMap || {')],
  ['扩展对象展开', text => text.replace("type: 'string',", "...extra, type: 'string',")],
  ['rules 展开', text => text.replace('rules: {', 'rules: { ...extra,')],
  ['规则内部展开', text => text.replace('mobile: {', 'mobile: { ...extra,')],
  ['重复键', text => text.replace('rules: {', 'rules: { mobile: {},')],
  ['动态返回', text => text.replace('return customRuleType.extend', 'if (flag) return customRuleType; return customRuleType.extend')],
  ['缺少初始化函数', text => text.replace('initRuleType', 'otherInit')],
  ['返回类型别名', text => text.replace('CustomStringSchema<TSchema>;', 'OtherSchema<TSchema>;')],
  ['消息展开', text => text.replace('messages: {', 'messages: { ...extra,')],
];
for (const [name, modify] of unsafe) test(`${name} 保留整个本地文件并转人工`, () => {
  for (const [current, target] of [[modify(local), fixture], [local, modify(fixture)]]) {
    const result = mergeSource(current, target, base, 'validation');
    assert.equal(result.content, current);
    assert.equal(result.changed, false);
    assert.ok(result.manual.length);
  }
});

test('导入冲突、遮蔽、type-only 值、外部引用和缺失类型安全阻断，消息与接口不半更新', () => {
  const target = "import { normalize } from './helper.js';\n" + fixture.replace('return value;', 'return normalize(value);');
  const cases = [
    ["import { normalize } from './other.js';\n" + local, target],
    ["import type { normalize } from './helper.js';\n" + local, target],
    [local.replace('  localCalls++;', '  const normalize = (value: string) => value; localCalls++;'), target],
    [local, target.replace('import { normalize }', 'import type { normalize }')],
    [local, fixture.replace('return value;', 'return missing(value);')],
    [local, "const external = 1;\n" + fixture.replace('return value;', 'return value + external;')],
    [local, fixture.replace('mobile(): this;', 'mobile(value: Missing): this;')],
    [local.replace('mobile(legacy?: boolean): this;', 'mobile: string;'), fixture],
  ];
  for (const [current, next] of cases) {
    const result = mergeSource(current, next, base, 'validation');
    assert.equal(result.content, current);
    assert.equal(result.changed, false);
    assert.ok(result.manual.length);
  }
});
