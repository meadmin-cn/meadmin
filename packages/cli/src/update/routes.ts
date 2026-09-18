import ts from 'typescript';

type Edit = { start: number; end: number; text: string };
type Route = { node: ts.ObjectLiteralExpression; properties: Map<string, ts.ObjectLiteralElementLike>; path?: string; name?: string; identity: string };
type Root = { expression: ts.Expression; statement: ts.Statement; array?: ts.ArrayLiteralExpression };

function unwrap(node: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isTypeAssertionExpression(node)) node = node.expression;
  return node;
}

function properties(node: ts.ObjectLiteralExpression): Map<string, ts.ObjectLiteralElementLike> | undefined {
  const result = new Map<string, ts.ObjectLiteralElementLike>();
  for (const item of node.properties) {
    const name = item.name && (ts.isIdentifier(item.name) || ts.isStringLiteral(item.name)) ? item.name.text : undefined;
    if (name === undefined || name === '__proto__' || result.has(name)) return undefined;
    result.set(name, item);
  }
  return result;
}

function value(property: ts.ObjectLiteralElementLike | undefined): ts.Expression | undefined {
  return property && ts.isPropertyAssignment(property) ? unwrap(property.initializer) : undefined;
}

function literal(node: ts.Expression | undefined): string | undefined {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;
}

function route(node: ts.Expression): Route | undefined {
  node = unwrap(node);
  if (!ts.isObjectLiteralExpression(node)) return undefined;
  const fields = properties(node);
  if (!fields) return undefined;
  const path = literal(value(fields.get('path'))),
    name = literal(value(fields.get('name')));
  if ((fields.has('path') && path === undefined) || (fields.has('name') && name === undefined) || (path === undefined && name === undefined)) return undefined;
  return { node, properties: fields, path, name, identity: path === undefined ? `name:${name}` : `path:${path}` };
}

function roots(file: ts.SourceFile): Map<string, Root> {
  const declarations = new Map<string, ts.VariableDeclaration>();
  for (const statement of file.statements)
    if (ts.isVariableStatement(statement) && statement.declarationList.flags & ts.NodeFlags.Const) {
      for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name)) declarations.set(declaration.name.text, declaration);
    }
  const resolve = (expression: ts.Expression, seen = new Set<string>()): ts.ArrayLiteralExpression | undefined => {
    expression = unwrap(expression);
    if (ts.isArrayLiteralExpression(expression)) return expression;
    if (!ts.isIdentifier(expression) || seen.has(expression.text)) return undefined;
    seen.add(expression.text);
    const declaration = declarations.get(expression.text);
    return declaration?.initializer && resolve(declaration.initializer, seen);
  };
  const result = new Map<string, Root>();
  const add = (name: string, expression: ts.Expression, statement: ts.Statement) => result.set(name, { expression, statement, array: resolve(expression) });
  for (const statement of file.statements) {
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) add('default', statement.expression, statement);
    else if (ts.isVariableStatement(statement) && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const declaration of statement.declarationList.declarations)
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          const name = declaration.name.text;
          const array = statement.declarationList.flags & ts.NodeFlags.Const ? resolve(declaration.initializer) : undefined;
          if (array || /routes$/i.test(name)) result.set(name, { expression: declaration.initializer, statement, array });
        }
    } else if (ts.isExportDeclaration(statement) && !statement.moduleSpecifier && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const item of statement.exportClause.elements) {
        const declaration = declarations.get((item.propertyName ?? item.name).text);
        if (declaration?.initializer) add(item.name.text, declaration.initializer, statement);
      }
    }
  }
  return result;
}

/** 只对静态路由容器插入文本，不求值路径、模块或运行时注册逻辑。 */
export function planRoutes(local: ts.SourceFile, target: ts.SourceFile, accept: (node: ts.Node, destination: ts.Node) => boolean): { edits: Edit[]; manual: string[] } {
  const edits: Edit[] = [],
    manual: string[] = [];
  const report = (label: string, reason: string) => manual.push(`routes ${label}: ${reason}，保留本地并转人工`);
  const leftRoots = roots(local),
    rightRoots = roots(target);
  const newline = local.text.includes('\r\n') ? '\r\n' : '\n';
  const names = new Set<string>();
  const collectNames = (array: ts.ArrayLiteralExpression) => {
    for (const element of array.elements) {
      const node = unwrap(element);
      if (!ts.isObjectLiteralExpression(node)) continue;
      const fields = properties(node);
      if (!fields) continue;
      const name = literal(value(fields.get('name')));
      if (name !== undefined) names.add(name);
      const children = value(fields.get('children'));
      if (children && ts.isArrayLiteralExpression(children)) collectNames(children);
    }
  };
  for (const root of leftRoots.values()) if (root.array) collectNames(root.array);
  const append = (container: ts.ArrayLiteralExpression | ts.ObjectLiteralExpression, additions: string[]) => {
    if (!additions.length) return;
    const items = ts.isArrayLiteralExpression(container) ? container.elements : container.properties;
    const last = items[items.length - 1];
    if (last && !items.hasTrailingComma) edits.push({ start: last.end, end: last.end, text: ',' });
    edits.push({ start: container.end - 1, end: container.end - 1, text: `${newline}${additions.join(`,${newline}`)}${newline}` });
  };
  const children = (item: Route) => value(item.properties.get('children'));
  const validSubtree = (item: Route, label: string, addedNames: Set<string>): boolean => {
    if (item.name !== undefined) {
      if (names.has(item.name) || addedNames.has(item.name)) {
        report(label, `name ${item.name} 已存在或重复`);
        return false;
      }
      addedNames.add(item.name);
    }
    if (!item.properties.has('children')) return true;
    const nested = children(item);
    if (!nested || !ts.isArrayLiteralExpression(nested)) {
      report(label, '动态 children 无法安全追加');
      return false;
    }
    const identities = new Set<string>();
    for (const expression of nested.elements) {
      const child = route(expression);
      if (!child || identities.has(child.identity)) {
        report(label, '子树包含动态 path/name、spread、computed、重复键或重复路由');
        return false;
      }
      identities.add(child.identity);
      if (!validSubtree(child, `${label}/${child.identity}`, addedNames)) return false;
    }
    return true;
  };
  const visited = new Map<ts.ArrayLiteralExpression, ts.ArrayLiteralExpression>();
  const merge = (left: ts.ArrayLiteralExpression | undefined, right: ts.ArrayLiteralExpression, label: string, destination: ts.Node): string[] => {
    if (left) {
      const previous = visited.get(left);
      if (previous) {
        if (previous !== right) report(label, '多个导出映射到同一本地数组');
        return [];
      }
      visited.set(left, right);
    }
    const mutated = (array: ts.ArrayLiteralExpression, file: ts.SourceFile): boolean => {
      const bindings = new Set<string>();
      let declaration: ts.Node = array.parent;
      while (ts.isParenthesizedExpression(declaration) || ts.isAsExpression(declaration) || ts.isSatisfiesExpression(declaration) || ts.isTypeAssertionExpression(declaration)) declaration = declaration.parent;
      if (ts.isVariableDeclaration(declaration) && ts.isIdentifier(declaration.name)) bindings.add(declaration.name.text);
      let changed = true;
      while (changed) {
        changed = false;
        for (const statement of file.statements)
          if (ts.isVariableStatement(statement))
            for (const item of statement.declarationList.declarations) {
              if (ts.isIdentifier(item.name) && item.initializer && ts.isIdentifier(unwrap(item.initializer)) && bindings.has((unwrap(item.initializer) as ts.Identifier).text) && !bindings.has(item.name.text)) {
                bindings.add(item.name.text);
                changed = true;
              }
            }
      }
      let unsafe = false;
      const rooted = (node: ts.Expression): boolean => {
        node = unwrap(node);
        if (ts.isIdentifier(node)) return bindings.has(node.text);
        return (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) && rooted(node.expression);
      };
      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node) && (ts.isPropertyAccessExpression(node.expression) || ts.isElementAccessExpression(node.expression)) && rooted(node.expression.expression)) unsafe = true;
        if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment && rooted(node.left)) unsafe = true;
        if ((ts.isPostfixUnaryExpression(node) || ts.isPrefixUnaryExpression(node) || ts.isDeleteExpression(node)) && rooted(ts.isDeleteExpression(node) ? node.expression : node.operand)) unsafe = true;
        ts.forEachChild(node, visit);
      };
      visit(file);
      return unsafe;
    };
    if ((left && mutated(left, local)) || mutated(right, target)) {
      report(label, '路由数组存在运行时访问或修改，无法静态确认注册项');
      return [];
    }
    const current = left?.elements.map(route) ?? [];
    const incoming = right.elements.map(route);
    const duplicate = (items: (Route | undefined)[]) => items.some((item, index) => item && items.some((other, otherIndex) => otherIndex !== index && other && (other.identity === item.identity || (item.name !== undefined && item.name === other.name))));
    if (duplicate(current) || duplicate(incoming)) {
      report(label, '同级 path/name 重复，无法唯一匹配');
      return [];
    }
    const uncertain = current.some((item) => !item);
    if (uncertain) {
      report(label, '本地存在动态 path/name、spread、computed、重复键或非对象路由，无法判断路由是否唯一');
      return [];
    }
    const additions: string[] = [];
    for (const item of incoming) {
      if (!item) {
        report(label, '目标存在动态 path/name、spread、computed、重复键或非对象路由');
        continue;
      }
      // path 只在同级比较；缺少 path 才以 name 备用，已有同名记录始终保留。
      const existing = current.find((other) => other && item.path !== undefined && other.path === item.path) ?? current.find((other) => other && item.name !== undefined && other.name === item.name && (item.path === undefined || other.path === undefined));
      if (existing) {
        if (!item.properties.has('children')) continue;
        const rightChildren = children(item),
          leftChildren = children(existing);
        if (!rightChildren || !ts.isArrayLiteralExpression(rightChildren) || (existing.properties.has('children') && (!leftChildren || !ts.isArrayLiteralExpression(leftChildren)))) {
          report(`${label}/${item.identity}`, '动态 children 无法递归合并');
          continue;
        }
        if (leftChildren && ts.isArrayLiteralExpression(leftChildren)) merge(leftChildren, rightChildren, `${label}/${item.identity}`, leftChildren);
        else {
          const added = merge(undefined, rightChildren, `${label}/${item.identity}`, existing.node);
          if (added.length) append(existing.node, [`children: [${newline}${added.join(`,${newline}`)}${newline}]`]);
        }
        continue;
      }
      if (item.name !== undefined && current.some((other) => other?.name === item.name)) {
        report(`${label}/${item.identity}`, `同名 ${item.name} 的本地 path 不同`);
        continue;
      }
      const addedNames = new Set<string>();
      if (!validSubtree(item, `${label}/${item.identity}`, addedNames) || !accept(item.node, destination)) continue;
      additions.push(item.node.getText(target));
      for (const name of addedNames) names.add(name);
    }
    if (left) append(left, additions);
    return additions;
  };
  for (const [name, right] of rightRoots) {
    const left = leftRoots.get(name);
    if (!left?.array || !right.array) {
      report(name, '缺少对应静态路由数组或导出，需人工集成');
      continue;
    }
    merge(left.array, right.array, name, left.array);
  }
  // 路由节点以外的导入副作用、声明和执行语句不通过整文件更新带入。
  const skeleton = (file: ts.SourceFile, containers: Map<string, Root>) => {
    let text = file.text;
    const ranges = [...new Set([...containers.values()].map((root) => root.array).filter((array): array is ts.ArrayLiteralExpression => !!array))].map((array) => ({ start: array.getStart(), end: array.end }));
    for (const statement of file.statements) if (ts.isImportDeclaration(statement) && statement.importClause) ranges.push({ start: statement.getStart(), end: statement.end });
    for (const range of ranges.sort((a, b) => b.start - a.start)) text = text.slice(0, range.start) + text.slice(range.end);
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, text);
    const tokens: string[] = [];
    for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) tokens.push(`${token}:${scanner.getTokenText()}`);
    return tokens.join('|');
  };
  if (!rightRoots.size || skeleton(local, leftRoots) !== skeleton(target, rightRoots)) report('集成入口', '非静态路由声明、导出或运行时代码需人工检查');
  return { edits, manual: [...new Set(manual)] };
}
