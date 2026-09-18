import { applyEdits, getNodeValue, modify, parseTree, type Node as JsonNode, type ParseError } from 'jsonc-parser';
import ts from 'typescript';

export type MergeResult = { content: string; manual: string[] };

type Edit = { start: number; end: number; text: string };
type Parsed = { file: ts.SourceFile; checker: ts.TypeChecker };
const dependencyGroups = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;

function apply(text: string, edits: Edit[]): string {
  return [...edits]
    .reverse()
    .sort((a, b) => b.start - a.start)
    .reduce((result, edit) => result.slice(0, edit.start) + edit.text + result.slice(edit.end), text);
}

function unwrap(node: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isTypeAssertionExpression(node)) {
    node = node.expression;
  }
  return node;
}

function key(node: ts.PropertyName | undefined): string | undefined {
  return node && (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) ? node.text : undefined;
}

function parse(text: string, name: string): Parsed | undefined {
  const file = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if ((file as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] }).parseDiagnostics.length) return undefined;
  const options: ts.CompilerOptions = { noLib: true, noResolve: true, target: ts.ScriptTarget.Latest, experimentalDecorators: true };
  const host: ts.CompilerHost = {
    getSourceFile: (path) => (path === name ? file : undefined),
    getDefaultLibFileName: () => '',
    writeFile: () => {},
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    fileExists: (path) => path === name,
    readFile: (path) => (path === name ? text : undefined),
    getCanonicalFileName: (path) => path,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };
  const program = ts.createProgram([name], options, host);
  return { file, checker: program.getTypeChecker() };
}

function objectProperties(node: ts.ObjectLiteralExpression): Map<string, ts.PropertyAssignment> | undefined {
  const result = new Map<string, ts.PropertyAssignment>();
  for (const property of node.properties) {
    const name = key(property.name);
    if (!ts.isPropertyAssignment(property) || name === undefined || name === '__proto__' || result.has(name)) return undefined;
    result.set(name, property);
  }
  return result;
}

function jsonObject(text: string): ts.ObjectLiteralExpression | undefined {
  const file = ts.createSourceFile('package.ts', `(${text})`, ts.ScriptTarget.Latest, true);
  const statement = file.statements[0];
  if (!statement || !ts.isExpressionStatement(statement)) return undefined;
  const expression = unwrap(statement.expression);
  return ts.isObjectLiteralExpression(expression) ? expression : undefined;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function ordinaryVersion(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && /^[\d\s.vxX*~^<>=|+-]+(?:[a-zA-Z0-9.+\s~^<>=|-]*)$/.test(value) && /^(?:[~^<>=\s]*v?(?:\d|[xX*]))/.test(value);
}

// 通过语法树识别键，不将配置展开到普通对象，避免原型键和重复键歧义。
export function mergeJsonConfig(local: string, target: string, rootKeys?: readonly string[]): MergeResult {
  const manual: string[] = [];
  const read = (text: string) => {
    const errors: ParseError[] = [];
    const node = parseTree(text, errors, { allowTrailingComma: true });
    const safe = (value: JsonNode): boolean => {
      if (value.type === 'object') {
        const seen = new Set<string>();
        for (const property of value.children ?? []) {
          const name = property.children![0].value as string;
          if (['__proto__', 'constructor', 'prototype'].includes(name) || seen.has(name)) return false;
          seen.add(name);
        }
      }
      return (value.children ?? []).every(safe);
    };
    return !errors.length && node?.type === 'object' && safe(node) ? node : undefined;
  };
  const current = read(local),
    next = read(target);
  if (!current || !next) return { content: local, manual: ['JSON/JSONC: 语法、根对象、重复键或不安全键需人工处理'] };
  let content = local;
  const merge = (left: JsonNode, right: JsonNode, path: string[]) => {
    const entries = new Map((left.children ?? []).map((property) => [property.children![0].value as string, property.children![1]]));
    for (const property of right.children ?? []) {
      const name = property.children![0].value as string;
      if (!path.length && rootKeys && !rootKeys.includes(name)) continue;
      const value = property.children![1],
        existing = entries.get(name),
        location = [...path, name];
      if (!existing) {
        content = applyEdits(content, modify(content, location, getNodeValue(value), {}));
      } else if (existing.type === 'object' && value.type === 'object') merge(existing, value, location);
      else if (existing.type !== value.type) manual.push(`${location.join('.')}: 结构变化，保留本地值，需人工确认`);
    }
  };
  merge(current, next, []);
  return { content, manual };
}

export function mergePackage(local: string, target: string, base?: string): MergeResult {
  const manual: string[] = [];
  const edits: Edit[] = [];
  let current: unknown, next: unknown, previous: unknown;
  try {
    current = JSON.parse(local);
    next = JSON.parse(target);
    previous = base === undefined ? undefined : JSON.parse(base);
  } catch {
    return { content: local, manual: ['package.json: JSON 无效，需人工合并'] };
  }
  if (!record(current) || !record(next) || (base !== undefined && !record(previous))) {
    return { content: local, manual: ['package.json: 根节点必须为对象'] };
  }
  const root = jsonObject(local);
  const targetRoot = jsonObject(target);
  const baseRoot = base === undefined ? undefined : jsonObject(base);
  const roots = [root, targetRoot, ...(base === undefined ? [] : [baseRoot])];
  if (roots.some((value) => !value || !objectProperties(value))) {
    return { content: local, manual: ['package.json: 重复或不安全的键，需人工合并'] };
  }
  const localProperties = objectProperties(root!)!;
  const newGroups: string[] = [];
  // JSON 在 AST 中包裹了一层括号，插入位置需要还原为原文件偏移。
  const appendJson = (node: ts.ObjectLiteralExpression, additions: string[]) => {
    const insertions: Edit[] = [];
    appendMembers(`(${local})`, node, additions, insertions);
    edits.push(...insertions.map((edit) => ({ ...edit, start: edit.start - 1, end: edit.end - 1 })));
  };
  for (const group of dependencyGroups) {
    const objects = [current[group], next[group], record(previous) ? previous[group] : undefined];
    const nodes = roots.map((value) => objectProperties(value!)!.get(group)?.initializer);
    if (objects.some((value) => value !== undefined && !record(value)) || nodes.some((value) => value && (!ts.isObjectLiteralExpression(value) || !objectProperties(value)))) {
      manual.push(`${group}: 依赖组结构无效，需人工合并`);
      continue;
    }
    const localGroup = record(current[group]) ? current[group] : {};
    const targetGroup = record(next[group]) ? next[group] : {};
    const baseGroup = record(previous) && record(previous[group]) ? previous[group] : {};
    const additions: string[] = [];
    for (const [name, version] of Object.entries(targetGroup)) {
      const path = `${group}.${name}`;
      const acrossGroups = dependencyGroups.some((other) => other !== group && [current, next, previous].some((source) => record(source) && record(source[other]) && Object.hasOwn(source[other], name)));
      if (acrossGroups) {
        manual.push(`${path}: 跨依赖组或多组同名依赖，需人工合并`);
        continue;
      }
      if (!Object.hasOwn(localGroup, name)) {
        if (typeof version !== 'string' || !version.trim()) {
          manual.push(`${path}: 目标依赖版本声明无效，需人工处理`);
        } else {
          additions.push(`${JSON.stringify(name)}: ${JSON.stringify(version)}`);
        }
        continue;
      }
      if (localGroup[name] === version) continue;
      if (!ordinaryVersion(version) || !ordinaryVersion(localGroup[name]) || (Object.hasOwn(baseGroup, name) && !ordinaryVersion(baseGroup[name]))) {
        manual.push(`${path}: 特殊协议或非普通版本，需人工合并`);
        continue;
      }
      // package.json 按目标声明对齐已有依赖，不以旧模板的版本变化为前提。
      if (localGroup[name] !== baseGroup[name]) {
        manual.push(`${path}: 本地和目标均修改版本，确认后采用目标版本 ${String(version)}`);
      }
      const groupNode = localProperties.get(group)!.initializer as ts.ObjectLiteralExpression;
      const versionNode = objectProperties(groupNode)!.get(name)!.initializer;
      edits.push({ start: versionNode.getStart() - 1, end: versionNode.end - 1, text: JSON.stringify(version) });
    }
    if (additions.length) {
      const node = localProperties.get(group)?.initializer;
      if (node && ts.isObjectLiteralExpression(node)) appendJson(node, additions);
      else newGroups.push(`${JSON.stringify(group)}: { ${additions.join(', ')} }`);
    }
  }
  appendJson(root!, newGroups);
  const config = mergeJsonConfig(apply(local, edits), target, ['pnpm', 'overrides', 'resolutions', 'engines', 'packageManager', 'workspaces']);
  return { content: config.content, manual: [...manual, ...config.manual] };
}

function indentAt(text: string, position: number): string {
  return /^[\t ]*/.exec(text.slice(text.lastIndexOf('\n', position - 1) + 1, position))![0];
}

function appendMembers(text: string, node: ts.ObjectLiteralExpression | ts.ClassDeclaration, additions: string[], edits: Edit[]): void {
  if (!additions.length) return;
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const members = ts.isObjectLiteralExpression(node) ? node.properties : node.members;
  const closingIndent = indentAt(text, node.getStart());
  const first = members[0];
  const existingIndent = first ? indentAt(text, first.getStart()) : '';
  const indentation = existingIndent.length > closingIndent.length ? existingIndent : `${closingIndent}  `;
  const values = additions.map((value) => indentation + value.replace(/\r?\n/g, newline));
  const last = members[members.length - 1];
  if (ts.isObjectLiteralExpression(node) && last && !node.properties.hasTrailingComma) {
    edits.push({ start: last.end, end: last.end, text: ',' });
  }
  if (ts.isClassDeclaration(node) && last && ts.isPropertyDeclaration(last) && !text.slice(last.getStart(), last.end).trimEnd().endsWith(';') && !edits.some((edit) => edit.start === last.getStart() && edit.end === last.end && edit.text.trimEnd().endsWith(';'))) {
    edits.push({ start: last.end, end: last.end, text: ';' });
  }
  const separator = ts.isObjectLiteralExpression(node) ? `,${newline}` : newline;
  edits.push({ start: node.end - 1, end: node.end - 1, text: `${newline}${values.join(separator)}${newline}${closingIndent}` });
}

type ImportBinding = { name: string; imported: string; module: string; typeOnly: boolean; declaration: ts.ImportDeclaration; identifier: ts.Identifier };

function imports(file: ts.SourceFile): Map<string, ImportBinding> {
  const result = new Map<string, ImportBinding>();
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || !statement.importClause) continue;
    const clause = statement.importClause;
    const add = (identifier: ts.Identifier, imported: string, typeOnly = clause.isTypeOnly) => result.set(identifier.text, { name: identifier.text, imported, module: (statement.moduleSpecifier as ts.StringLiteral).text, typeOnly, declaration: statement, identifier });
    if (clause.name) add(clause.name, 'default');
    if (clause.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) add(clause.namedBindings.name, '*');
      else for (const specifier of clause.namedBindings.elements) add(specifier.name, (specifier.propertyName ?? specifier.name).text, clause.isTypeOnly || specifier.isTypeOnly);
    }
  }
  return result;
}

function topBindings(parsed: Parsed): Map<string, ts.Symbol> {
  return new Map(
    parsed.checker
      .getSymbolsInScope(parsed.file, ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Namespace | ts.SymbolFlags.Alias)
      .filter((symbol) => symbol.declarations?.some((declaration) => declaration.getSourceFile() === parsed.file))
      .map((symbol) => [symbol.name, symbol]),
  );
}

const globals = new Set(
  'undefined NaN Infinity Object String Number Boolean BigInt Symbol Math JSON Date RegExp Array ReadonlyArray Promise Map Set WeakMap WeakSet Error TypeError RangeError Intl Reflect Proxy ArrayBuffer DataView Uint8Array Uint16Array Uint32Array Int8Array Int16Array Int32Array Float32Array Float64Array console globalThis parseInt parseFloat isNaN isFinite encodeURI encodeURIComponent decodeURI decodeURIComponent Record Partial Required Readonly Pick Omit Exclude Extract NonNullable ReturnType Parameters InstanceType Awaited'.split(
    ' ',
  ),
);

function isReference(node: ts.Identifier): boolean {
  const parent = node.parent;
  if ((ts.isPropertyAccessExpression(parent) && parent.name === node) || (ts.isQualifiedName(parent) && parent.right === node)) return false;
  if ('name' in parent && parent.name === node && !ts.isShorthandPropertyAssignment(parent)) return false;
  return true;
}

function bindingReferences(parsed: Parsed, symbol: ts.Symbol): ts.Identifier[] {
  const result: ts.Identifier[] = [];
  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isIdentifier(node)) {
      const parent = node.parent;
      let reference: ts.Symbol | undefined;
      if (ts.isExportSpecifier(parent)) {
        if (!parent.parent.parent.moduleSpecifier && node === (parent.propertyName ?? parent.name)) reference = parsed.checker.getExportSpecifierLocalTargetSymbol(parent);
      } else if (isReference(node)) {
        reference = ts.isShorthandPropertyAssignment(parent) ? parsed.checker.getShorthandAssignmentValueSymbol(parent) : parsed.checker.getSymbolAtLocation(node);
      }
      if (reference === symbol) result.push(node);
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed.file);
  return result;
}

function removeImportBinding(binding: ImportBinding): Edit {
  const declaration = binding.declaration,
    clause = declaration.importClause!;
  const parent = binding.identifier.parent;
  if (ts.isImportSpecifier(parent)) {
    const elements = parent.parent.elements;
    const index = elements.indexOf(parent);
    if (elements.length > 1) {
      return index === 0 ? { start: parent.getStart(), end: elements[1].getStart(), text: '' } : { start: elements[index - 1].end, end: parent.end, text: '' };
    }
    if (clause.name) return { start: clause.name.end, end: parent.parent.end, text: '' };
  } else if (ts.isImportClause(parent) && clause.namedBindings) {
    return { start: binding.identifier.getStart(), end: clause.namedBindings.getStart(), text: '' };
  } else if (ts.isNamespaceImport(parent) && clause.name) {
    return { start: clause.name.end, end: parent.end, text: '' };
  }
  return { start: declaration.getStart(), end: declaration.end, text: '' };
}

// 在所有字段和接口合并后回收本次生成的别名；每次重解析，避免不同来源竞争同一个名称。
function reclaimImportAliases(text: string, generated: Map<string, string>): string {
  for (const [alias, name] of generated) {
    const parsed = parse(text, 'merged.ts');
    if (!parsed) return text;
    const bindings = imports(parsed.file);
    const old = bindings.get(name),
      replacement = bindings.get(alias);
    if (!old || !replacement) continue;
    const oldSymbol = parsed.checker.getSymbolAtLocation(old.identifier);
    const symbol = parsed.checker.getSymbolAtLocation(replacement.identifier);
    if (!oldSymbol || !symbol || oldSymbol.declarations?.length !== 1 || symbol.declarations?.length !== 1 || bindingReferences(parsed, oldSymbol).length) continue;
    const references = bindingReferences(parsed, symbol);
    const captured = references.some((node) => parsed.checker.getSymbolsInScope(node, ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Namespace | ts.SymbolFlags.Alias).some((candidate) => candidate.name === name && candidate !== oldSymbol));
    if (captured) continue;
    const declaration = replacement.identifier.parent;
    const edits: Edit[] = [removeImportBinding(old)];
    if (ts.isImportSpecifier(declaration)) {
      const imported = declaration.propertyName ?? declaration.name;
      edits.push({ start: imported.getStart(), end: declaration.name.end, text: imported.text === name ? name : `${imported.getText()} as ${name}` });
    } else {
      edits.push({ start: replacement.identifier.getStart(), end: replacement.identifier.end, text: name });
    }
    for (const node of references) {
      // 简写属性和导出别名的对外名称不随导入绑定重命名。
      const value = ts.isShorthandPropertyAssignment(node.parent) ? `${node.text}: ${name}` : ts.isExportSpecifier(node.parent) && !node.parent.propertyName ? `${name} as ${node.text}` : name;
      edits.push({ start: node.getStart(), end: node.end, text: value });
    }
    text = apply(text, edits);
  }
  return text;
}

function referenceMerger(local: Parsed, target: Parsed, manual: string[], aliasConflicts = false, allowEnvironmentReferences = false) {
  const localImports = imports(local.file);
  const targetImports = imports(target.file);
  const localBindings = topBindings(local);
  const pending = new Map<string, ImportBinding>();
  const generated = new Map<string, string>();
  const rendered = new Map<ts.Node, string>();
  function safe(node: ts.Node, path: string, destination: ts.Node): boolean {
    const scope = new Map(local.checker.getSymbolsInScope(destination, ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Namespace | ts.SymbolFlags.Alias).map((symbol) => [symbol.name, symbol]));
    const needed = new Map<string, ImportBinding>();
    const aliases = new Map<string, string>();
    const renames: Edit[] = [];
    const problems = new Set<string>();
    function visit(child: ts.Node): void {
      if (child.kind === ts.SyntaxKind.ThisKeyword || child.kind === ts.SyntaxKind.SuperKeyword || ts.isPrivateIdentifier(child)) {
        problems.add('this/super/私有名称引用需人工确认');
      }
      if (ts.isIdentifier(child) && isReference(child)) {
        const symbol = ts.isShorthandPropertyAssignment(child.parent) ? target.checker.getShorthandAssignmentValueSymbol(child.parent) : target.checker.getSymbolAtLocation(child);
        const declarations = symbol?.declarations ?? [];
        const inside = declarations.length > 0 && declarations.every((declaration) => declaration.pos >= node.pos && declaration.end <= node.end);
        if (!inside) {
          const binding = targetImports.get(child.text);
          if (binding && declarations.some((declaration) => ts.isImportSpecifier(declaration) || ts.isImportClause(declaration) || ts.isNamespaceImport(declaration))) {
            const existing = localImports.get(binding.name) ?? pending.get(binding.name);
            const shadow = scope.get(binding.name);
            if (shadow && shadow !== localBindings.get(binding.name)) {
              problems.add(`import ${binding.name} 被本地作用域声明遮蔽`);
            } else if (existing && (existing.module !== binding.module || existing.imported !== binding.imported || (existing.typeOnly && !binding.typeOnly))) {
              if (!aliasConflicts || !ts.isPropertyDeclaration(node) || binding.declaration.attributes) {
                problems.add(`import ${binding.name} 命名或类型冲突`);
              } else {
                const compatible = [...localImports.values(), ...pending.values(), ...needed.values()].find((candidate) => candidate.module === binding.module && candidate.imported === binding.imported && (!candidate.typeOnly || binding.typeOnly) && (!scope.has(candidate.name) || scope.get(candidate.name) === localBindings.get(candidate.name)));
                let alias = compatible?.name;
                if (!alias) {
                  let suffix = 1;
                  alias = `${binding.name}Meadmin`;
                  while (localBindings.has(alias) || targetImports.has(alias) || scope.has(alias) || pending.has(alias) || needed.has(alias) || node.getText().includes(alias)) alias = `${binding.name}Meadmin${suffix++}`;
                  needed.set(alias, { ...binding, name: alias });
                  aliases.set(alias, binding.name);
                }
                renames.push({ start: child.getStart() - node.getStart(), end: child.end - node.getStart(), text: ts.isShorthandPropertyAssignment(child.parent) ? `${child.text}: ${alias}` : alias });
              }
            } else if (!existing && localBindings.has(binding.name)) {
              problems.add(`import ${binding.name} 与本地声明冲突`);
            } else if (!existing && binding.declaration.attributes) {
              problems.add(`import ${binding.name} 含导入属性，需人工确认`);
            } else if (!existing) needed.set(binding.name, binding);
            // 导入简写固定为显式键值，回收别名后再次合并也保持同一表示。
            if (aliasConflicts && ts.isShorthandPropertyAssignment(child.parent) && !renames.some((edit) => edit.start === child.getStart() - node.getStart())) {
              renames.push({ start: child.getStart() - node.getStart(), end: child.end - node.getStart(), text: `${child.text}: ${child.text}` });
            }
          } else {
            const existing = localBindings.get(child.text);
            // 仅允许未被声明或遮蔽的 process.env.KEY，不放行其他 process API。
            const environmentReference = allowEnvironmentReferences && child.text === 'process' && !declarations.length && !scope.has(child.text) && !pending.has(child.text) && !needed.has(child.text) && ts.isPropertyAccessExpression(child.parent) && child.parent.expression === child && child.parent.name.text === 'env' && ts.isPropertyAccessExpression(child.parent.parent) && child.parent.parent.expression === child.parent;
            if (scope.get(child.text) && scope.get(child.text) !== existing) {
              problems.add(`引用 ${child.text} 被本地作用域声明遮蔽`);
            } else if (declarations.length && existing && !localImports.has(child.text) && existing.flags & symbol!.flags & (ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Namespace)) {
              const targetParameter = declarations.find(ts.isTypeParameterDeclaration);
              if (targetParameter) problems.add(`类型参数 ${child.text} 的作用域需人工确认`);
            } else if (declarations.length || (!globals.has(child.text) && !environmentReference)) {
              problems.add(`引用 ${child.text} 在本地缺失或无法解析`);
            }
          }
        }
      }
      ts.forEachChild(child, visit);
    }
    visit(node);
    if (problems.size) {
      manual.push(`${path}: ${[...problems].join('；')}`);
      return false;
    }
    for (const [name, binding] of needed) pending.set(name, binding);
    for (const [alias, name] of aliases) generated.set(alias, name);
    rendered.set(node, apply(node.getText(target.file), renames));
    return true;
  }
  function finish(text: string, edits: Edit[]): void {
    if (!pending.size) return;
    const newline = text.includes('\r\n') ? '\r\n' : '\n';
    const lines = [...pending.values()].map((binding) => {
      const clause = binding.imported === 'default' ? binding.name : binding.imported === '*' ? `* as ${binding.name}` : `{ ${binding.imported === binding.name ? binding.name : `${/^[A-Za-z_$][\w$]*$/.test(binding.imported) ? binding.imported : JSON.stringify(binding.imported)} as ${binding.name}`} }`;
      return `import ${binding.typeOnly ? 'type ' : ''}${clause} from ${JSON.stringify(binding.module)};`;
    });
    const last = [...local.file.statements].reverse().find(ts.isImportDeclaration);
    const position = last ? last.end : text.startsWith('#!') ? (text.indexOf('\n') < 0 ? text.length : text.indexOf('\n') + 1) : 0;
    edits.push({ start: position, end: position, text: `${position ? newline : ''}${lines.join(newline)}${newline}` });
  }
  function changedImports(node: ts.Node): boolean {
    return [...targetImports.values()].some((binding) => {
      const existing = localImports.get(binding.name);
      if (existing && existing.module === binding.module && existing.imported === binding.imported && (!existing.typeOnly || binding.typeOnly)) return false;
      const symbol = target.checker.getSymbolAtLocation(binding.identifier);
      return !!symbol && bindingReferences(target, symbol).some((reference) => reference.pos >= node.pos && reference.end <= node.end);
    });
  }
  return { safe, finish, changedImports, reclaim: (text: string) => reclaimImportAliases(text, generated), text: (node: ts.Node) => rendered.get(node) ?? node.getText(target.file) };
}

function defaultObject(file: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
  const exports = file.statements.filter(ts.isExportAssignment);
  if (exports.length !== 1 || exports[0].isExportEquals) return undefined;
  const expression = unwrap(exports[0].expression);
  return ts.isObjectLiteralExpression(expression) ? expression : undefined;
}

function staticValue(node: ts.Expression): boolean {
  node = unwrap(node);
  if (ts.isObjectLiteralExpression(node)) {
    const properties = objectProperties(node);
    return !!properties && [...properties.values()].every((property) => staticValue(property.initializer));
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.every((element) => !ts.isSpreadElement(element) && staticValue(element));
  if (ts.isIdentifier(node) || ts.isLiteralExpression(node) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(node.kind)) return true;
  if (ts.isPropertyAccessExpression(node)) return staticValue(node.expression);
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) return staticValue(node.left) && staticValue(node.right);
  if (ts.isPrefixUnaryExpression(node) && [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken, ts.SyntaxKind.ExclamationToken, ts.SyntaxKind.TildeToken].includes(node.operator)) return staticValue(node.operand);
  return false;
}

export function mergeConfig(local: string, target: string, base?: string): MergeResult {
  void base;
  const manual: string[] = [];
  const edits: Edit[] = [];
  const current = parse(local, 'local.ts');
  const next = parse(target, 'target.ts');
  const localObject = current && defaultObject(current.file);
  const targetObject = next && defaultObject(next.file);
  if (!current || !next || !localObject || !targetObject) {
    return { content: local, manual: ['config: 无法解析静态 export default 对象，需人工合并'] };
  }
  const references = referenceMerger(current, next, manual, false, true);
  function merge(left: ts.ObjectLiteralExpression, right: ts.ObjectLiteralExpression, path: string): void {
    const localProperties = objectProperties(left);
    const targetProperties = objectProperties(right);
    if (!localProperties || !targetProperties) {
      manual.push(`${path}: 包含展开、计算键、重复键或复杂成员，需人工合并`);
      return;
    }
    const additions: string[] = [];
    for (const [name, property] of targetProperties) {
      const existing = localProperties.get(name);
      const propertyPath = `${path}.${name}`;
      const value = unwrap(property.initializer);
      if (!existing) {
        if (!staticValue(value)) manual.push(`${propertyPath}: 动态或复杂值，需人工合并`);
        else if (references.safe(property, propertyPath, left)) additions.push(property.getText(next!.file));
      } else {
        const localValue = unwrap(existing.initializer);
        if (ts.isObjectLiteralExpression(localValue) && ts.isObjectLiteralExpression(value)) merge(localValue, value, propertyPath);
        else if (!staticValue(localValue) || !staticValue(value) || ts.isObjectLiteralExpression(localValue) !== ts.isObjectLiteralExpression(value)) {
          manual.push(`${propertyPath}: 动态值或结构变化，保留本地值并需人工确认`);
        }
      }
    }
    appendMembers(local, left, additions, edits);
  }
  merge(localObject, targetObject, 'config');
  references.finish(local, edits);
  return { content: apply(local, edits), manual };
}

function exportedClasses(file: ts.SourceFile): Map<string, ts.ClassDeclaration> {
  const result = new Map<string, ts.ClassDeclaration>();
  for (const statement of file.statements) {
    if (ts.isClassDeclaration(statement) && statement.name && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      result.set(statement.name.text, statement);
    }
  }
  return result;
}

function classHeader(node: ts.ClassDeclaration): string {
  return [...(node.modifiers ?? []).map((modifier) => modifier.getText()), ...(node.heritageClauses ?? []).map((clause) => clause.getText()), ...(node.typeParameters ?? []).map((parameter) => parameter.getText())].join(' ');
}

export function mergeEntity(local: string, target: string, base?: string): MergeResult {
  const manual: string[] = [];
  const edits: Edit[] = [];
  const current = parse(local, 'local.ts');
  const next = parse(target, 'target.ts');
  const previous = base === undefined ? undefined : parse(base, 'base.ts');
  if (!current || !next || (base !== undefined && !previous)) return { content: local, manual: ['entity: TypeScript 语法无效，需人工合并'] };
  const localClasses = exportedClasses(current.file);
  const targetClasses = exportedClasses(next.file);
  const baseClasses = previous && exportedClasses(previous.file);
  if (!targetClasses.size) manual.push('entity: 未找到具名导出 class，需人工合并');
  const references = referenceMerger(current, next, manual, true);
  for (const [name, right] of targetClasses) {
    const left = localClasses.get(name);
    if (!left) {
      manual.push(`entity.${name}: 本地缺少同名导出 class，需人工合并`);
      continue;
    }
    const baseline = baseClasses?.get(name);
    if (classHeader(left) !== classHeader(right) && (!baseline || classHeader(baseline) !== classHeader(right))) manual.push(`entity.${name}: 类装饰器、修饰器、继承或类型参数变化，需人工合并`);
    if (left.members.some((member) => member.name && key(member.name) === undefined) || right.members.some((member) => member.name && key(member.name) === undefined)) {
      manual.push(`entity.${name}: 计算键或私有名称无法安全匹配，需人工合并`);
      continue;
    }
    const duplicateFields = (node: ts.ClassDeclaration) => node.members.some((member, index) => ts.isPropertyDeclaration(member) && node.members.some((other, otherIndex) => index !== otherIndex && key(other.name) === key(member.name)));
    if (duplicateFields(left) || duplicateFields(right)) {
      manual.push(`entity.${name}: 重复字段或字段与成员冲突，需人工合并`);
      continue;
    }
    const members = new Map(left.members.map((member) => [key(member.name), member]));
    const additions: string[] = [];
    const seen = new Set<string>();
    for (const member of right.members) {
      const field = key(member.name);
      const path = `entity.${name}.${field ?? 'constructor/static'}`;
      if (field !== undefined && seen.has(field)) {
        manual.push(`${path}: 重复成员或访问器，需人工合并`);
        continue;
      }
      if (field !== undefined) seen.add(field);
      const existing = members.get(field);
      const parameterProperty = left.members.some((item) => ts.isConstructorDeclaration(item) && item.parameters.some((parameter) => ts.isIdentifier(parameter.name) && parameter.name.text === field && parameter.modifiers?.some((modifier) => [ts.SyntaxKind.PublicKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ReadonlyKeyword].includes(modifier.kind))));
      if (parameterProperty) {
        manual.push(`${path}: 与本地构造函数参数属性冲突，需人工合并`);
        continue;
      }
      if (!ts.isPropertyDeclaration(member) || field === undefined || member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AccessorKeyword)) {
        if (!existing || existing.getText() !== member.getText()) manual.push(`${path}: 方法、访问器或复杂成员需人工合并`);
        continue;
      }
      if (existing) {
        if (!ts.isPropertyDeclaration(existing) || !!existing.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword) !== !!member.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.StaticKeyword)) {
          manual.push(`${path}: 与本地成员类型或静态修饰冲突，需人工合并`);
          continue;
        }
        // 同名字段采用目标声明（包含装饰器、类型和初始值），本地独有字段不删除。
        if (existing.getText(current.file) === member.getText(next.file) && !references.changedImports(member)) continue;
        if (references.safe(member, path, left)) {
          const text = references.text(member).replace(/;?\s*$/, ';');
          if (text !== existing.getText(current.file)) edits.push({ start: existing.getStart(current.file), end: existing.end, text });
        }
        continue;
      }
      if (references.safe(member, path, left)) additions.push(references.text(member).replace(/;?\s*$/, ';'));
    }
    appendMembers(local, left, additions, edits);
  }
  // Sequelize 关联方法通过同名 interface 声明合并扩展，不属于 class 字段。
  const typeKey = (node: ts.ExpressionWithTypeArguments, file: ts.SourceFile) => {
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, node.getText(file));
    const tokens: [number, string][] = [];
    for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
      tokens.push([token, token === ts.SyntaxKind.StringLiteral ? scanner.getTokenValue() : scanner.getTokenText()]);
    }
    return JSON.stringify(tokens);
  };
  const known = new Map<string, Set<string>>();
  for (const statement of current.file.statements) {
    if (!ts.isInterfaceDeclaration(statement)) continue;
    const types = known.get(statement.name.text) ?? new Set<string>();
    for (const clause of statement.heritageClauses ?? []) for (const type of clause.types) types.add(typeKey(type, current.file));
    known.set(statement.name.text, types);
  }
  const interfaceAdditions: string[] = [];
  for (const statement of next.file.statements) {
    if (!ts.isInterfaceDeclaration(statement) || !localClasses.has(statement.name.text)) continue;
    const name = statement.name.text;
    const types = known.get(name) ?? new Set<string>();
    if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) || statement.members.length || statement.typeParameters?.length) {
      manual.push(`entity.${name}: 非空或泛型接口声明需人工合并，保留本地声明`);
      continue;
    }
    for (const clause of statement.heritageClauses ?? [])
      for (const type of clause.types) {
        const identity = typeKey(type, next.file);
        if (types.has(identity)) continue;
        if (!references.safe(type, `entity.${name} interface`, current.file)) continue;
        interfaceAdditions.push(`export declare interface ${name} extends ${type.getText(next.file)} {}`);
        types.add(identity);
      }
    known.set(name, types);
  }
  if (interfaceAdditions.length) {
    const newline = local.includes('\r\n') ? '\r\n' : '\n';
    edits.push({ start: local.length, end: local.length, text: newline + interfaceAdditions.join(newline) + newline });
  }
  references.finish(local, edits);
  return { content: references.reclaim(apply(local, edits)), manual };
}
