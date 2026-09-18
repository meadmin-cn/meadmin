import ts from 'typescript';

export type SourceMergeMode = 'functions' | 'exports';
export type SourceMergeResult = { content: string; manual: string[]; changed: boolean };
type Edit = { start: number; end: number; text: string };
type Parsed = { file: ts.SourceFile; checker: ts.TypeChecker; program: ts.Program };
type ImportBinding = { name: string; imported: string; module: string; typeOnly: boolean; declaration: ts.ImportDeclaration };
type Unit = { name: string; nodes: ts.Node[]; statement?: ts.VariableStatement; owner?: ts.ClassDeclaration };
type Change = { unit: Unit; previous?: Unit; edits: Edit[]; imports: Map<string, ImportBinding>; dependencies: Set<string> };

function parse(text: string, name: string): Parsed | undefined {
  const file = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if ((file as ts.SourceFile & { parseDiagnostics?: readonly ts.Diagnostic[] }).parseDiagnostics?.length) return undefined;
  const host: ts.CompilerHost = {
    getSourceFile: (path) => (path === name ? file : undefined),
    getDefaultLibFileName: () => '',
    writeFile: () => undefined,
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    fileExists: (path) => path === name,
    readFile: (path) => (path === name ? text : undefined),
    getCanonicalFileName: (path) => path,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  };
  const program = ts.createProgram([name], { noLib: true, noResolve: true, target: ts.ScriptTarget.Latest, experimentalDecorators: true }, host);
  return { file, checker: program.getTypeChecker(), program };
}

function apply(text: string, edits: Edit[]): string {
  return [...edits]
    .reverse()
    .sort((a, b) => b.start - a.start || b.end - a.end)
    .reduce((result, edit) => result.slice(0, edit.start) + edit.text + result.slice(edit.end), text);
}

function unwrap(node: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isTypeAssertionExpression(node)) node = node.expression;
  return node;
}

function nameOf(node: ts.NamedDeclaration): string | undefined {
  return node.name && (ts.isIdentifier(node.name) || ts.isPrivateIdentifier(node.name) || ts.isStringLiteral(node.name) || ts.isNumericLiteral(node.name)) ? node.name.text : undefined;
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && !!ts.getModifiers(node)?.some((modifier) => modifier.kind === kind);
}

function imports(file: ts.SourceFile): Map<string, ImportBinding> {
  const result = new Map<string, ImportBinding>();
  for (const declaration of file.statements) {
    if (!ts.isImportDeclaration(declaration) || !ts.isStringLiteral(declaration.moduleSpecifier) || !declaration.importClause) continue;
    const clause = declaration.importClause;
    const module = declaration.moduleSpecifier.text;
    const add = (name: string, imported: string, typeOnly = clause.isTypeOnly) => result.set(name, { name, imported, module, typeOnly, declaration });
    if (clause.name) add(clause.name.text, 'default');
    if (clause.namedBindings) {
      if (ts.isNamespaceImport(clause.namedBindings)) add(clause.namedBindings.name.text, '*');
      else for (const item of clause.namedBindings.elements) add(item.name.text, (item.propertyName ?? item.name).text, clause.isTypeOnly || item.isTypeOnly);
    }
  }
  return result;
}

function topBindings(parsed: Parsed): Map<string, ts.Symbol> {
  return new Map(
    parsed.checker
      .getSymbolsInScope(parsed.file, ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Namespace | ts.SymbolFlags.Alias)
      .filter((symbol) => symbol.declarations?.some((node) => node.getSourceFile() === parsed.file))
      .map((symbol) => [symbol.name, symbol]),
  );
}

function variables(file: ts.SourceFile): Map<string, ts.VariableDeclaration> {
  const result = new Map<string, ts.VariableDeclaration>();
  for (const statement of file.statements)
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name)) result.set(declaration.name.text, declaration);
    }
  return result;
}

function staticValue(node: ts.Expression): boolean {
  node = unwrap(node);
  if (ts.isArrayLiteralExpression(node)) return node.elements.every((item) => !ts.isSpreadElement(item) && !ts.isOmittedExpression(item) && staticValue(item));
  if (ts.isPropertyAccessExpression(node)) return staticValue(node.expression);
  return ts.isIdentifier(node) || ts.isLiteralExpression(node) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(node.kind);
}

function resolveArray(node: ts.Expression, declarations: Map<string, ts.VariableDeclaration>, seen = new Set<string>()): ts.ArrayLiteralExpression | undefined {
  node = unwrap(node);
  if (ts.isArrayLiteralExpression(node)) return node;
  if (!ts.isIdentifier(node) || seen.has(node.text)) return undefined;
  seen.add(node.text);
  const declaration = declarations.get(node.text);
  return declaration?.initializer && declaration.parent.flags & ts.NodeFlags.Const ? resolveArray(declaration.initializer, declarations, seen) : undefined;
}

/** 只识别静态集成入口；包含类、函数或执行语句的入口仍交由其他规则处理。 */
export function isIntegrationSource(text: string): boolean {
  const parsed = parse(text, 'integration.ts');
  if (!parsed?.file.statements.length) return false;
  const declarations = variables(parsed.file);
  const bindings = imports(parsed.file);
  const used = new Set<string>();
  function staticReference(node: ts.Expression, visiting = new Set<string>()): boolean {
    node = unwrap(node);
    if (ts.isIdentifier(node)) {
      if (bindings.has(node.text)) return true;
      const declaration = declarations.get(node.text);
      if (!declaration?.initializer || visiting.has(node.text) || !(declaration.parent.flags & ts.NodeFlags.Const)) return false;
      used.add(node.text);
      return staticReference(declaration.initializer, new Set([...visiting, node.text]));
    }
    if (ts.isPropertyAccessExpression(node)) return staticReference(node.expression, visiting);
    return ts.isArrayLiteralExpression(node) && node.elements.every((item) => staticReference(item, visiting));
  }
  let exported = false;
  for (const statement of parsed.file.statements) {
    if (ts.isImportDeclaration(statement)) continue;
    if (ts.isExportDeclaration(statement)) {
      exported = true;
      if (!statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const item of statement.exportClause.elements) {
          const name = item.propertyName ?? item.name;
          if (!ts.isIdentifier(name) || !staticReference(name)) return false;
        }
      }
      continue;
    }
    if (ts.isExportAssignment(statement)) {
      if (statement.isExportEquals || !staticReference(statement.expression)) return false;
      exported = true;
      continue;
    }
    if (!ts.isVariableStatement(statement) || !(statement.declarationList.flags & ts.NodeFlags.Const)) return false;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer || !staticReference(declaration.initializer)) return false;
      if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
        used.add(declaration.name.text);
        exported = true;
      }
    }
  }
  return exported && [...declarations.keys()].every((name) => used.has(name));
}

function functionLike(node: ts.Node): boolean {
  return ts.isArrowFunction(node) || ts.isFunctionExpression(node);
}

function functions(file: ts.SourceFile): Map<string, Unit> {
  const result = new Map<string, Unit>();
  for (const statement of file.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      const name = statement.name.text;
      const unit = result.get(name) ?? { name, nodes: [] };
      unit.nodes.push(statement);
      result.set(name, unit);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer && functionLike(unwrap(declaration.initializer))) {
          result.set(declaration.name.text, { name: declaration.name.text, nodes: [declaration], statement });
        }
      }
    }
  }
  return result;
}

function memberKey(member: ts.ClassElement): string | undefined {
  if (ts.isConstructorDeclaration(member)) return 'instance:constructor';
  const name = nameOf(member);
  if (name === undefined) return undefined;
  const kind = ts.isMethodDeclaration(member) ? 'method' : ts.isGetAccessorDeclaration(member) ? 'get' : ts.isSetAccessorDeclaration(member) ? 'set' : ts.isPropertyDeclaration(member) && member.initializer && functionLike(unwrap(member.initializer)) ? 'arrow' : 'field';
  return `${hasModifier(member, ts.SyntaxKind.StaticKeyword) ? 'static' : 'instance'}:${kind}:${name}`;
}

function members(owner: ts.ClassDeclaration): Map<string, Unit> {
  const result = new Map<string, Unit>();
  for (const member of owner.members) {
    const key = memberKey(member);
    if (!key) continue;
    const unit = result.get(key) ?? { name: key, nodes: [], owner };
    unit.nodes.push(member);
    result.set(key, unit);
  }
  return result;
}

function classes(file: ts.SourceFile): Map<string, ts.ClassDeclaration> {
  return new Map(
    file.statements
      .filter(ts.isClassDeclaration)
      .filter((node) => !!node.name)
      .map((node) => [node.name!.text, node]),
  );
}

function unitText(unit: Unit): string {
  return unit.nodes.map((node) => node.getText(node.getSourceFile())).join('\n');
}

function overloaded(unit: Unit): boolean {
  return unit.nodes.length > 1 || unit.nodes.some((node) => (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) && !node.body);
}

const globals = new Set(
  'undefined NaN Infinity Object String Number Boolean BigInt Symbol Math JSON Date RegExp Array ReadonlyArray Promise Map Set WeakMap WeakSet Error TypeError RangeError Intl Reflect Proxy ArrayBuffer DataView Uint8Array Uint16Array Uint32Array Int8Array Int16Array Int32Array Float32Array Float64Array console globalThis parseInt parseFloat isNaN isFinite encodeURI encodeURIComponent decodeURI decodeURIComponent Record Partial Required Readonly Pick Omit Exclude Extract NonNullable ReturnType Parameters InstanceType ConstructorParameters Awaited PropertyKey'.split(
    ' ',
  ),
);

function isReference(node: ts.Identifier): boolean {
  const parent = node.parent;
  if ((ts.isPropertyAccessExpression(parent) && parent.name === node) || (ts.isQualifiedName(parent) && parent.right === node)) return false;
  if (ts.isBindingElement(parent) && parent.propertyName === node) return false;
  if (ts.isLabeledStatement(parent) || ts.isBreakStatement(parent) || ts.isContinueStatement(parent)) return false;
  return !('name' in parent && parent.name === node && !ts.isShorthandPropertyAssignment(parent));
}

function importIdentity(binding: ImportBinding): string {
  return JSON.stringify([binding.module, binding.imported, binding.declaration.attributes?.getText() ?? '']);
}

function importLine(binding: ImportBinding): string {
  const imported = /^[A-Za-z_$][\w$]*$/.test(binding.imported) ? binding.imported : JSON.stringify(binding.imported);
  const clause = binding.imported === 'default' ? binding.name : binding.imported === '*' ? `* as ${binding.name}` : `{ ${binding.imported === binding.name ? imported : `${imported} as ${binding.name}`} }`;
  return `import ${binding.typeOnly ? 'type ' : ''}${clause} from ${JSON.stringify(binding.module)};`;
}

/** 按函数和静态注册项增量合并，所有坐标和文本均属于节点自身的 SourceFile。 */
export function mergeSource(localText: string, targetText: string, baseText: string | undefined, mode: SourceMergeMode, path = 'source.ts'): SourceMergeResult {
  const local = parse(localText, 'local.ts');
  const target = parse(targetText, 'target.ts');
  const base = baseText === undefined ? undefined : parse(baseText, 'base.ts');
  if (!local || !target || (baseText !== undefined && !base)) return { content: localText, manual: [`${path}: TypeScript 语法无效，保留本地文件`], changed: false };
  const edits: Edit[] = [];
  const manual: string[] = [];
  const report = (message: string) => manual.push(`${path}: ${message}`);
  const newline = localText.includes('\r\n') ? '\r\n' : '\n';
  const localImports = imports(local.file),
    targetImports = imports(target.file);
  const localBindings = topBindings(local),
    targetBindings = topBindings(target);
  const pendingImports = new Map<string, ImportBinding>();
  const available = new Set(localBindings.keys());
  const appended: string[] = [];
  const append = (text: string) => appended.push(text);
  const localVariables = variables(local.file),
    targetVariables = variables(target.file);

  function importProblem(binding: ImportBinding): string | undefined {
    const existing = localImports.get(binding.name) ?? pendingImports.get(binding.name);
    if (existing && (importIdentity(existing) !== importIdentity(binding) || (existing.typeOnly && !binding.typeOnly))) return `import ${binding.name} 命名或 type-only 冲突`;
    if (!existing && available.has(binding.name)) return `import ${binding.name} 与本地声明冲突`;
    if (!existing && binding.declaration.attributes) return `import ${binding.name} 含导入属性，需人工确认`;
    return undefined;
  }

  function references(nodes: ts.Node[], label: string, owner?: ts.ClassDeclaration, destination?: ts.ClassDeclaration, candidates = new Set<string>()): { needed: Map<string, ImportBinding>; dependencies: Set<string> } | undefined {
    const needed = new Map<string, ImportBinding>();
    const dependencies = new Set<string>();
    const problems = new Set<string>();
    const within = (declaration: ts.Node) => nodes.some((node) => declaration.getSourceFile() === node.getSourceFile() && declaration.pos >= node.pos && declaration.end <= node.end);
    const hasMember = (name: string, isStatic: boolean) =>
      !!destination &&
      (destination.members.some((member) => nameOf(member) === name && hasModifier(member, ts.SyntaxKind.StaticKeyword) === isStatic) || (!isStatic && destination.members.some((member) => ts.isConstructorDeclaration(member) && member.parameters.some((parameter) => nameOf(parameter) === name && parameter.modifiers?.some((modifier) => [ts.SyntaxKind.PublicKeyword, ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword, ts.SyntaxKind.ReadonlyKeyword].includes(modifier.kind))))));
    function visit(child: ts.Node): void {
      if (child.kind === ts.SyntaxKind.SuperKeyword) problems.add('super 引用需人工确认');
      if (child.kind === ts.SyntaxKind.ThisKeyword) {
        const parent = child.parent;
        const access = ts.isPropertyAccessExpression(parent) && parent.expression === child ? parent.name.text : ts.isElementAccessExpression(parent) && parent.expression === child && (ts.isStringLiteral(parent.argumentExpression) || ts.isNumericLiteral(parent.argumentExpression)) ? parent.argumentExpression.text : undefined;
        const isStatic = hasModifier(nodes[0], ts.SyntaxKind.StaticKeyword);
        let scope: ts.Node | undefined = child.parent;
        while (scope && !nodes.includes(scope) && !(ts.isFunctionLike(scope) && !ts.isArrowFunction(scope)) && !ts.isClassExpression(scope) && !ts.isClassDeclaration(scope)) scope = scope.parent;
        if (!owner || !scope || !nodes.includes(scope) || access === undefined || !hasMember(access, isStatic)) problems.add(`this.${access ?? '?'} 在本地缺失或作用域不明确`);
      }
      if (ts.isIdentifier(child) && isReference(child)) {
        const symbol = ts.isShorthandPropertyAssignment(child.parent) ? target!.checker.getShorthandAssignmentValueSymbol(child.parent) : target!.checker.getSymbolAtLocation(child);
        const declarations = symbol?.declarations ?? [];
        if (declarations.length && declarations.every(within)) {
          ts.forEachChild(child, visit);
          return;
        }
        const binding = targetImports.get(child.text);
        if (binding && declarations.some((node) => ts.isImportClause(node) || ts.isImportSpecifier(node) || ts.isNamespaceImport(node))) {
          let context: ts.Node = child;
          while (context.parent && !ts.isTypeNode(context) && !ts.isExpression(context.parent) && !ts.isStatement(context.parent)) context = context.parent;
          if (binding.typeOnly && (!ts.isTypeNode(context) || ts.isTypeQueryNode(context))) problems.add(`import ${binding.name} 是 type-only，不能用于值引用`);
          const problem = importProblem(binding);
          const scope = destination && local!.checker.getSymbolsInScope(destination.members[0] ?? destination, ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Namespace | ts.SymbolFlags.Alias).find((symbol) => symbol.name === binding.name);
          if (scope && scope !== localBindings.get(binding.name)) problems.add(`import ${binding.name} 被本地类作用域遮蔽`);
          if (problem) problems.add(problem);
          else if (!localImports.has(binding.name) && !pendingImports.has(binding.name)) needed.set(binding.name, binding);
        } else if (owner && declarations.some((node) => ts.isTypeParameterDeclaration(node) && node.parent === owner)) {
          const parameter = owner.typeParameters?.find((node) => node.name.text === child.text);
          if (!destination?.typeParameters?.some((node) => node.getText() === parameter?.getText())) problems.add(`类类型参数 ${child.text} 不兼容`);
        } else if (symbol && (targetBindings.get(child.text) === symbol || declarations.some((declaration) => targetBindings.get(child.text)?.declarations?.includes(declaration)))) {
          const existing = localBindings.get(child.text);
          if (existing && !localImports.has(child.text) && existing.flags & symbol.flags & (ts.SymbolFlags.Value | ts.SymbolFlags.Type | ts.SymbolFlags.Namespace)) {
            // 本地同名依赖保持原实现，不能借机覆盖字段、常量或类型。
          } else if (candidates.has(child.text) && !existing) dependencies.add(child.text);
          else if (!available.has(child.text) || localImports.has(child.text) || existing) problems.add(`引用 ${child.text} 在本地缺失或绑定不兼容`);
        } else if (declarations.length || !globals.has(child.text) || available.has(child.text)) {
          problems.add(`引用 ${child.text} 在本地缺失或无法解析`);
        }
      }
      ts.forEachChild(child, visit);
    }
    nodes.forEach(visit);
    if (problems.size) {
      report(`${label}: ${[...problems].join('；')}，保留本地并转人工`);
      return undefined;
    }
    return { needed, dependencies };
  }

  const exportNames = new Map<string, string>();
  function bindingIdentity(name: string, bindings: Map<string, ImportBinding>): string {
    const binding = bindings.get(name);
    return binding ? `import:${importIdentity(binding)}` : `local:${name}`;
  }
  function exportIdentity(statement: ts.ExportDeclaration, imported: string, bindings: Map<string, ImportBinding>): string {
    return statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) ? JSON.stringify([statement.moduleSpecifier.text, imported, statement.attributes?.getText() ?? '']) : bindingIdentity(imported, bindings);
  }
  for (const statement of local.file.statements) {
    if (ts.isExportDeclaration(statement) && statement.exportClause) {
      if (ts.isNamedExports(statement.exportClause)) for (const item of statement.exportClause.elements) exportNames.set(item.name.text, exportIdentity(statement, (item.propertyName ?? item.name).text, localImports));
      else exportNames.set(statement.exportClause.name.text, exportIdentity(statement, '*', localImports));
    } else if (ts.isExportAssignment(statement)) exportNames.set('default', bindingIdentity(statement.expression.getText(), localImports));
    else if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
      if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) exportNames.set('default', `local:${nameOf(statement as unknown as ts.NamedDeclaration) ?? 'default'}`);
      else if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name)) exportNames.set(declaration.name.text, `local:${declaration.name.text}`);
      } else {
        const name = nameOf(statement as unknown as ts.NamedDeclaration);
        if (name) exportNames.set(name, `local:${name}`);
      }
    }
  }

  if (mode === 'functions') {
    const localFunctions = functions(local.file),
      targetFunctions = functions(target.file),
      baseFunctions = base ? functions(base.file) : new Map<string, Unit>();
    const localClasses = classes(local.file),
      targetClasses = classes(target.file),
      baseClasses = base ? classes(base.file) : new Map<string, ts.ClassDeclaration>();
    const changes: Change[] = [];
    const candidates = new Set(targetFunctions.keys());
    const plan = (unit: Unit, previous?: Unit, baseline?: Unit, destination?: ts.ClassDeclaration) => {
      const label = unit.owner ? `${unit.owner.name!.text}.${unit.name}` : `函数 ${unit.name}`;
      if ((baseline && unitText(unit) === unitText(baseline)) || (previous && unitText(unit) === unitText(previous))) return;
      if (previous && !baseline) {
        report(`${label}: 缺少该函数的基线，保留本地并转人工`);
        return;
      }
      if (unit.name === 'instance:constructor') {
        report(`${label}: 构造函数保留，需人工合并`);
        return;
      }
      if (overloaded(unit) || (previous && overloaded(previous))) {
        report(`${label}: 重载组需整体人工合并`);
        return;
      }
      const node = unit.nodes[0];
      if (!previous && !unit.owner && (available.has(unit.name) || targetImports.has(unit.name))) {
        report(`${label}: 与本地或目标同名声明冲突`);
        return;
      }
      if (previous && !!unit.statement !== !!previous.statement) {
        report(`${label}: 函数声明形式变化，需人工合并`);
        return;
      }
      if (unit.owner && !previous && destination) {
        const isStatic = hasModifier(node, ts.SyntaxKind.StaticKeyword);
        const name = nameOf(node as ts.NamedDeclaration);
        const conflict = destination.members.some((member) => nameOf(member) === name && hasModifier(member, ts.SyntaxKind.StaticKeyword) === isStatic && !((ts.isGetAccessorDeclaration(node) && ts.isSetAccessorDeclaration(member)) || (ts.isSetAccessorDeclaration(node) && ts.isGetAccessorDeclaration(member))));
        const parameterProperty = !isStatic && destination.members.some((member) => ts.isConstructorDeclaration(member) && member.parameters.some((parameter) => nameOf(parameter) === name && parameter.modifiers?.length));
        if (conflict || parameterProperty) {
          report(`${label}: 与本地字段或成员种类冲突`);
          return;
        }
      }
      const statement = unit.statement ?? node;
      const previousStatement = previous?.statement ?? previous?.nodes[0];
      if (previousStatement && (hasModifier(statement, ts.SyntaxKind.ExportKeyword) !== hasModifier(previousStatement, ts.SyntaxKind.ExportKeyword) || hasModifier(statement, ts.SyntaxKind.DefaultKeyword) !== hasModifier(previousStatement, ts.SyntaxKind.DefaultKeyword))) {
        report(`${label}: 导出形式变化，需人工合并`);
        return;
      }
      if (!previous && !unit.owner && hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
        const exported = hasModifier(statement, ts.SyntaxKind.DefaultKeyword) ? 'default' : unit.name;
        if (exportNames.has(exported)) {
          report(`${label}: 导出名 ${exported} 冲突`);
          return;
        }
      }
      const checked = references(unit.nodes, label, unit.owner, destination, candidates);
      if (!checked) return;
      const unitEdits: Edit[] = [];
      if (previous) unitEdits.push({ start: previous.nodes[0].getStart(), end: previous.nodes[0].end, text: node.getText() });
      else if (destination) {
        const last = destination.members[destination.members.length - 1];
        if (last && ts.isPropertyDeclaration(last) && !last.getText().trimEnd().endsWith(';')) unitEdits.push({ start: last.end, end: last.end, text: ';' });
        unitEdits.push({ start: destination.end - 1, end: destination.end - 1, text: `${newline}  ${node.getText().replace(/;?\s*$/, ';')}${newline}` });
      } else {
        const text = unit.statement ? `${hasModifier(unit.statement, ts.SyntaxKind.ExportKeyword) ? 'export ' : ''}${unit.statement.declarationList.flags & ts.NodeFlags.Const ? 'const' : unit.statement.declarationList.flags & ts.NodeFlags.Let ? 'let' : 'var'} ${node.getText()};` : node.getText();
        unitEdits.push({ start: localText.length, end: localText.length, text: `${newline}${text}${newline}` });
      }
      changes.push({ unit, previous, edits: unitEdits, imports: checked.needed, dependencies: checked.dependencies });
    };
    // 目录采用函数合并不代表常量、类型变化可以静默忽略。
    const priorVariables = base ? variables(base.file) : new Map<string, ts.VariableDeclaration>();
    for (const [name, declaration] of targetVariables) {
      if (targetFunctions.has(name)) continue;
      const old = priorVariables.get(name),
        current = localVariables.get(name);
      if (declaration.getText() !== old?.getText() && declaration.getText() !== current?.getText()) report(`声明 ${name}: 非函数变化保留本地，需人工合并`);
    }
    for (const statement of target.file.statements)
      if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement)) {
        const equivalent = (file?: ts.SourceFile) => file?.statements.find((node) => node.kind === statement.kind && (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isEnumDeclaration(node)) && node.name.text === statement.name.text)?.getText();
        if (statement.getText() !== equivalent(base?.file) && statement.getText() !== equivalent(local.file)) report(`类型 ${statement.name.text}: 保留本地，需人工合并`);
      }
    for (const [name, unit] of targetFunctions) plan(unit, localFunctions.get(name), baseFunctions.get(name));
    for (const [name, owner] of targetClasses) {
      const destination = localClasses.get(name);
      if (!destination) {
        report(`新增类 ${name} 未自动添加，类结构需人工确认`);
        continue;
      }
      const oldMembers = members(destination),
        baseMembers = baseClasses.has(name) ? members(baseClasses.get(name)!) : new Map<string, Unit>();
      for (const [key, unit] of members(owner)) {
        if (!key.includes(':field:')) plan(unit, oldMembers.get(key), baseMembers.get(key), destination);
        else if (unitText(unit) !== (baseMembers.get(key) ? unitText(baseMembers.get(key)!) : undefined) && unitText(unit) !== (oldMembers.get(key) ? unitText(oldMembers.get(key)!) : undefined)) {
          report(`${name}.${key}: 非函数字段发生变化，保留本地并转人工`);
        }
      }
    }
    // 先检查整个依赖图，再提交编辑，避免被阻断的新增函数留下悬空调用。
    let accepted = changes;
    while (true) {
      const names = new Set([...available, ...accepted.filter((change) => !change.unit.owner).map((change) => change.unit.name)]);
      const next = accepted.filter((change) => {
        const missing = [...change.dependencies].filter((name) => !names.has(name));
        if (missing.length) report(`${change.unit.name}: 依赖 ${missing.join(', ')} 未安全合并，转人工`);
        return !missing.length;
      });
      if (next.length === accepted.length) break;
      accepted = next;
    }
    for (const change of accepted) {
      for (const edit of change.edits) if (!edits.some((existing) => existing.start === edit.start && existing.end === edit.end && existing.text === edit.text)) edits.push(edit);
      for (const [name, binding] of change.imports) pendingImports.set(name, binding);
      if (!change.unit.owner) {
        available.add(change.unit.name);
        const statement = change.unit.statement ?? change.unit.nodes[0];
        if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) exportNames.set(hasModifier(statement, ts.SyntaxKind.DefaultKeyword) ? 'default' : change.unit.name, `local:${change.unit.name}`);
      }
      if (!change.previous) report(`新增${change.unit.owner ? '方法' : '函数'} ${change.unit.name}`);
    }
  } else {
    for (const binding of targetImports.values()) {
      const problem = importProblem(binding);
      if (problem) report(`${problem}，保留本地并转人工`);
      else if (!localImports.has(binding.name)) pendingImports.set(binding.name, binding);
    }
    const sideEffectKey = (node: ts.ImportDeclaration) => `${ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : node.moduleSpecifier.getText()}:${node.attributes?.getText() ?? ''}`;
    const sideEffects = new Set(
      local.file.statements
        .filter(ts.isImportDeclaration)
        .filter((node) => !node.importClause)
        .map(sideEffectKey),
    );
    for (const statement of target.file.statements)
      if (ts.isImportDeclaration(statement) && !statement.importClause) {
        const key = sideEffectKey(statement);
        if (!sideEffects.has(key)) {
          append(statement.getText());
          sideEffects.add(key);
        }
      }
  }

  function commitReferences(nodes: ts.Node[], label: string): boolean {
    const checked = references(nodes, label);
    if (!checked) return false;
    for (const [name, binding] of checked.needed) pendingImports.set(name, binding);
    return true;
  }

  function expressionKey(node: ts.Expression, bindings: Map<string, ImportBinding>): string {
    node = unwrap(node);
    if (ts.isIdentifier(node)) return bindingIdentity(node.text, bindings);
    if (ts.isPropertyAccessExpression(node)) return `${expressionKey(node.expression, bindings)}.${node.name.text}`;
    if (ts.isArrayLiteralExpression(node)) return JSON.stringify(node.elements.map((item) => expressionKey(item, bindings)));
    return ts.isStringLiteral(node) ? JSON.stringify(node.text) : node.getText();
  }

  const arrayAdditions = new Map<ts.ArrayLiteralExpression, string[]>();
  const arrayKeys = new Map<ts.ArrayLiteralExpression, Set<string>>();
  function mergeArray(left: ts.ArrayLiteralExpression, right: ts.ArrayLiteralExpression, label: string): void {
    if (!staticValue(left) || !staticValue(right)) {
      report(`${label}: 动态数组注册需人工合并`);
      return;
    }
    const keys = arrayKeys.get(left) ?? new Set(left.elements.map((item) => expressionKey(item, localImports)));
    const additions = arrayAdditions.get(left) ?? [];
    for (const item of right.elements) {
      const key = expressionKey(item, targetImports);
      if (!keys.has(key) && commitReferences([item], label)) {
        additions.push(item.getText());
        keys.add(key);
      }
    }
    arrayKeys.set(left, keys);
    arrayAdditions.set(left, additions);
  }

  function ensureVariable(name: string, visiting = new Set<string>()): boolean {
    if (available.has(name)) return !localImports.has(name) && !targetImports.has(name);
    const declaration = targetVariables.get(name);
    if (!declaration?.initializer || !(declaration.parent.flags & ts.NodeFlags.Const) || visiting.has(name)) return false;
    const value = unwrap(declaration.initializer);
    if (!ts.isArrayLiteralExpression(value) && !ts.isIdentifier(value)) return false;
    if (!staticValue(value)) return false;
    if (ts.isIdentifier(value) && targetVariables.has(value.text) && !ensureVariable(value.text, new Set([...visiting, name]))) return false;
    if (!commitReferences([declaration], `注册 ${name}`)) return false;
    let declarationText = declaration.getText();
    if (ts.isArrayLiteralExpression(value)) {
      const keys = new Set<string>();
      const unique = value.elements.filter((item) => {
        const key = expressionKey(item, targetImports);
        if (keys.has(key)) return false;
        keys.add(key);
        return true;
      });
      if (unique.length !== value.elements.length) declarationText = apply(declarationText, [{ start: value.getStart() - declaration.getStart(), end: value.end - declaration.getStart(), text: `[${unique.map((item) => item.getText()).join(', ')}]` }]);
    }
    append(`const ${declarationText};`);
    available.add(name);
    return true;
  }

  if (mode === 'exports') {
    for (const statement of target.file.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      if (!hasModifier(statement, ts.SyntaxKind.ExportKeyword)) continue;
      for (const declaration of statement.declarationList.declarations) {
        const name = ts.isIdentifier(declaration.name) ? declaration.name.text : undefined;
        if (!name || !declaration.initializer || !(statement.declarationList.flags & ts.NodeFlags.Const)) {
          report('非静态注册声明需人工合并');
          continue;
        }
        const right = resolveArray(declaration.initializer, targetVariables);
        const existing = localVariables.get(name);
        const left = existing?.initializer && resolveArray(existing.initializer, localVariables);
        if (exportNames.has(name) && exportNames.get(name) !== `local:${name}`) {
          report(`导出名 ${name} 冲突，保留本地`);
          continue;
        }
        if (right && left) mergeArray(left, right, name);
        else if (existing || !right || !ensureVariable(name)) {
          report(`注册 ${name} 结构或依赖不兼容，需人工合并`);
          continue;
        }
        if (!exportNames.has(name)) {
          append(`export { ${name} };`);
          exportNames.set(name, `local:${name}`);
        }
      }
    }
  }

  const stars = new Set(
    local.file.statements
      .filter(ts.isExportDeclaration)
      .filter((node) => !node.exportClause)
      .map((node) => `${node.isTypeOnly}:${node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier) ? node.moduleSpecifier.text : ''}:${node.attributes?.getText() ?? ''}`),
  );
  for (const statement of target.file.statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    if (!statement.exportClause) {
      const key = `${statement.isTypeOnly}:${statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : ''}:${statement.attributes?.getText() ?? ''}`;
      if (!stars.has(key)) {
        append(statement.getText());
        stars.add(key);
      }
      continue;
    }
    const items = ts.isNamedExports(statement.exportClause) ? statement.exportClause.elements : [statement.exportClause];
    const additions: string[] = [];
    for (const item of items) {
      const name = item.name.text;
      const imported = ts.isExportSpecifier(item) ? (item.propertyName ?? item.name).text : '*';
      const identity = exportIdentity(statement, imported, targetImports);
      if (exportNames.has(name)) {
        if (exportNames.get(name) !== identity) report(`导出名 ${name} 冲突，保留本地`);
        else if (mode === 'exports' && !statement.moduleSpecifier) {
          const existing = localVariables.get(imported),
            next = targetVariables.get(imported);
          const left = existing?.initializer && resolveArray(existing.initializer, localVariables),
            right = next?.initializer && resolveArray(next.initializer, targetVariables);
          if (left && right) mergeArray(left, right, name);
        }
        continue;
      }
      if (!statement.moduleSpecifier) {
        const binding = targetImports.get(imported);
        if (binding) {
          const problem = importProblem(binding);
          if (problem) {
            report(`导出 ${name}: ${problem}`);
            continue;
          }
          if (!localImports.has(imported)) pendingImports.set(imported, binding);
        } else if (!available.has(imported) && !(mode === 'exports' && ensureVariable(imported))) {
          report(`导出 ${name}: 引用 ${imported} 缺失，转人工`);
          continue;
        }
        const existing = localVariables.get(imported),
          next = targetVariables.get(imported);
        const left = existing?.initializer && resolveArray(existing.initializer, localVariables),
          right = next?.initializer && resolveArray(next.initializer, targetVariables);
        if (mode === 'exports' && left && right) mergeArray(left, right, name);
      }
      exportNames.set(name, identity);
      additions.push(item.getText());
    }
    if (additions.length) {
      const clause = ts.isNamedExports(statement.exportClause) ? `{ ${additions.join(', ')} }` : additions[0];
      append(`export ${statement.isTypeOnly ? 'type ' : ''}${clause}${statement.moduleSpecifier ? ` from ${statement.moduleSpecifier.getText()}` : ''}${statement.attributes ? ` ${statement.attributes.getText()}` : ''};`);
    }
  }

  if (mode === 'exports') {
    for (const statement of target.file.statements) {
      if (ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement) || ts.isVariableStatement(statement)) continue;
      if (!ts.isExportAssignment(statement) || statement.isExportEquals || !staticValue(statement.expression)) {
        report('非静态集成代码保留本地，需人工合并');
        continue;
      }
      const existing = local.file.statements.find(ts.isExportAssignment);
      const right = resolveArray(statement.expression, targetVariables),
        left = existing && resolveArray(existing.expression, localVariables);
      if (exportNames.has('default')) {
        if (left && right) mergeArray(left, right, 'default');
        else if (!existing || expressionKey(existing.expression, localImports) !== expressionKey(statement.expression, targetImports)) report('default 导出冲突，保留本地');
        continue;
      }
      const value = unwrap(statement.expression);
      if (ts.isIdentifier(value) && targetVariables.has(value.text) && !ensureVariable(value.text)) {
        report('default 注册依赖缺失，需人工合并');
        continue;
      }
      if (commitReferences([statement.expression], 'default')) {
        let text = statement.getText();
        if (ts.isArrayLiteralExpression(value)) {
          const seen = new Set<string>();
          const unique = value.elements.filter((item) => {
            const key = expressionKey(item, targetImports);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          if (unique.length !== value.elements.length) text = apply(text, [{ start: value.getStart() - statement.getStart(), end: value.end - statement.getStart(), text: `[${unique.map((item) => item.getText()).join(', ')}]` }]);
        }
        append(text);
        exportNames.set('default', statement.expression.getText());
      }
    }
  }

  for (const [array, additions] of arrayAdditions)
    if (additions.length) {
      const last = array.elements[array.elements.length - 1];
      if (last && !array.elements.hasTrailingComma) edits.push({ start: last.end, end: last.end, text: ',' });
      edits.push({ start: array.end - 1, end: array.end - 1, text: `${last ? ' ' : ''}${additions.join(', ')}` });
    }
  if (pendingImports.size) {
    const last = [...local.file.statements].reverse().find(ts.isImportDeclaration);
    const position = last ? last.end : localText.startsWith('#!') ? (localText.indexOf('\n') < 0 ? localText.length : localText.indexOf('\n') + 1) : 0;
    edits.push({ start: position, end: position, text: `${position ? newline : ''}${[...pendingImports.values()].map(importLine).join(newline)}${newline}` });
  }
  if (appended.length) edits.push({ start: localText.length, end: localText.length, text: `${newline}${appended.join(newline)}${newline}` });
  const content = apply(localText, edits);
  const output = parse(content, 'output.ts');
  // 无项目上下文时只比较绑定、导出和未声明引用诊断，忽略外部模块解析错误。
  const bindingDiagnostics = new Set([2300, 2304, 2323, 2391, 2393, 2395, 2440, 2451, 2484, 2528, 2552, 2614, 2683, 2693, 2724]);
  const diagnostics = (parsed: Parsed) =>
    parsed.program
      .getSemanticDiagnostics(parsed.file)
      .filter((item) => bindingDiagnostics.has(item.code))
      .map((item) => `${item.code}:${ts.flattenDiagnosticMessageText(item.messageText, '\n')}`);
  const before = diagnostics(local);
  const remaining = [...before];
  const introduced =
    output &&
    diagnostics(output).filter((message) => {
      const index = remaining.indexOf(message);
      if (index < 0) return true;
      remaining.splice(index, 1);
      return false;
    });
  if (!output || introduced?.length) {
    report(`合并结果${output ? `产生绑定或引用错误 (${introduced!.join('；')})` : '语法无效'}，保留本地并转人工`);
    return { content: localText, manual: [...new Set(manual)], changed: false };
  }
  return { content, manual: [...new Set(manual)], changed: content !== localText };
}
