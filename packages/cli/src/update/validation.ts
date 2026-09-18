import ts from 'typescript';

type Edit = { start: number; end: number; text: string };
export type ValidationChange = { node: ts.Node; destination: ts.Node; owner?: ts.InterfaceDeclaration };

function unwrap(node: ts.Expression): ts.Expression {
  while (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isTypeAssertionExpression(node) || ts.isSatisfiesExpression(node)) node = node.expression;
  return node;
}

function nameOf(node: ts.NamedDeclaration): string | undefined {
  return node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) || ts.isNumericLiteral(node.name)) ? node.name.text : undefined;
}

function properties(node: ts.ObjectLiteralExpression, extension = false): Map<string, ts.PropertyAssignment> {
  const result = new Map<string, ts.PropertyAssignment>();
  const seen = new Set<string>();
  for (const member of node.properties) {
    const name = nameOf(member);
    if (name === undefined || name === '__proto__' || seen.has(name)) throw new Error('对象包含动态键、展开、重复键或复杂成员');
    seen.add(name);
    if (extension && !['type', 'rules', 'messages'].includes(name) && (ts.isMethodDeclaration(member) || ts.isShorthandPropertyAssignment(member))) continue;
    if (!ts.isPropertyAssignment(member)) throw new Error('对象包含复杂成员');
    result.set(name, member);
  }
  return result;
}

function object(node: ts.Expression | undefined): ts.ObjectLiteralExpression {
  const value = node && unwrap(node);
  if (!value || !ts.isObjectLiteralExpression(value)) throw new Error('rules/messages 或扩展定义不是直接对象字面量');
  return value;
}

function returned(body: ts.ConciseBody): ts.Expression {
  if (!ts.isBlock(body)) return body;
  const returns: ts.ReturnStatement[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isFunctionLike(node)) return;
    if (ts.isReturnStatement(node)) returns.push(node);
    ts.forEachChild(node, visit);
  };
  visit(body);
  if (returns.length !== 1 || returns[0].parent !== body || !returns[0].expression) throw new Error('初始化函数包含分支返回或无法确认唯一返回值');
  return returns[0].expression;
}

function structure(file: ts.SourceFile) {
  const declarations = file.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])
    .filter((node) => ts.isIdentifier(node.name) && node.name.text === 'initRuleType');
  if (declarations.length !== 1 || !declarations[0].initializer) throw new Error('无法确认唯一 initRuleType 声明');
  const init = unwrap(declarations[0].initializer);
  if (!ts.isArrowFunction(init) && !ts.isFunctionExpression(init)) throw new Error('initRuleType 不是直接函数');
  const expression = returned(init.body);
  const call = unwrap(expression);
  if (!ts.isCallExpression(call) || !ts.isPropertyAccessExpression(call.expression) || call.expression.name.text !== 'extend' || !ts.isIdentifier(call.expression.expression) || call.arguments.length !== 1) throw new Error('无法确认直接 customRuleType.extend 调用');
  const receiver = call.expression.expression.text;
  if (!init.parameters.some((parameter) => ts.isIdentifier(parameter.name) && parameter.name.text === receiver)) throw new Error('extend 接收者不是初始化函数参数');
  const callback = unwrap(call.arguments[0]);
  if ((!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback)) || callback.parameters.length !== 1 || !ts.isIdentifier(callback.parameters[0].name)) throw new Error('extend 回调结构复杂');
  const extension = object(returned(callback.body));
  const entries = properties(extension, true);
  const type = entries.get('type')?.initializer;
  if (!type || !ts.isStringLiteral(unwrap(type))) throw new Error('校验类型不是静态字符串');
  const rules = object(entries.get('rules')?.initializer);
  const messages = entries.has('messages') ? object(entries.get('messages')!.initializer) : undefined;
  properties(rules);
  if (messages) properties(messages);
  for (const rule of rules.properties) {
    const value = object((rule as ts.PropertyAssignment).initializer);
    const names = new Set<string>();
    for (const member of value.properties) {
      const name = nameOf(member);
      if (name === undefined || names.has(name) || (!ts.isPropertyAssignment(member) && !ts.isMethodDeclaration(member))) throw new Error('规则定义包含动态键、展开或复杂成员');
      names.add(name);
    }
  }
  const names = new Set<string>();
  const visit = (node: ts.Node) => {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) names.add(node.typeName.text);
    ts.forEachChild(node, visit);
  };
  // 只从返回类型寻找接口，不把规则内部引用的其它接口当作校验接口。
  let returnedType = expression;
  while (ts.isParenthesizedExpression(returnedType) || ts.isAsExpression(returnedType) || ts.isTypeAssertionExpression(returnedType) || ts.isSatisfiesExpression(returnedType)) {
    if (!ts.isParenthesizedExpression(returnedType)) visit(returnedType.type);
    returnedType = returnedType.expression;
  }
  if (init.type) visit(init.type);
  const interfaces = file.statements.filter(ts.isInterfaceDeclaration).filter((node) => names.has(node.name.text));
  if (!interfaces.length) throw new Error('返回类型未直接引用本文件接口，需人工确认');
  if (new Set(interfaces.map((node) => node.name.text)).size !== interfaces.length) throw new Error('接口存在声明合并，需人工确认');
  return { extension, rules, messages, interfaces, type: (unwrap(type) as ts.StringLiteral).text };
}

/** 只规划定点编辑，任何结构或引用检查失败时由调用方整体放弃。 */
export function planValidation(local: ts.SourceFile, target: ts.SourceFile): { edits: Edit[]; checks: ValidationChange[] } {
  const left = structure(local),
    right = structure(target);
  if (left.type !== right.type) throw new Error('本地与目标校验类型不一致');
  const edits: Edit[] = [],
    checks: ValidationChange[] = [];
  const newline = local.text.includes('\r\n') ? '\r\n' : '\n';
  function append(container: ts.ObjectLiteralExpression | ts.InterfaceDeclaration, additions: string[]): void {
    if (!additions.length) return;
    const members = ts.isObjectLiteralExpression(container) ? container.properties : container.members;
    const last = members[members.length - 1];
    if (last && ts.isObjectLiteralExpression(container) && !container.properties.hasTrailingComma) edits.push({ start: last.end, end: last.end, text: ',' });
    if (last && ts.isInterfaceDeclaration(container) && !/[;,]$/.test(last.getText())) edits.push({ start: last.end, end: last.end, text: ';' });
    const indentAt = (position: number) => /^[\t ]*/.exec(local.text.slice(local.text.lastIndexOf('\n', position - 1) + 1, position))![0];
    const closingIndent = indentAt(container.getStart());
    const indent = members.length ? indentAt(members[0].getStart()) : `${closingIndent}  `;
    const separator = ts.isObjectLiteralExpression(container) ? `,${newline}` : newline;
    edits.push({ start: container.end - 1, end: container.end - 1, text: `${newline}${additions.map((text) => indent + text).join(separator)}${newline}${closingIndent}` });
  }
  function mergeObject(current: ts.ObjectLiteralExpression, next: ts.ObjectLiteralExpression): void {
    const previous = properties(current),
      additions: string[] = [];
    for (const [name, member] of properties(next)) {
      const existing = previous.get(name);
      // 文本相同仍检查绑定，防止同名导入指向不同模块。
      checks.push({ node: member, destination: current });
      if (existing) {
        if (existing.getText() !== member.getText()) edits.push({ start: existing.getStart(), end: existing.end, text: member.getText() });
      } else additions.push(member.getText());
    }
    append(current, additions);
  }
  mergeObject(left.rules, right.rules);
  if (right.messages) {
    if (left.messages) mergeObject(left.messages, right.messages);
    else {
      const member = properties(right.extension, true).get('messages')!;
      checks.push({ node: member, destination: left.extension });
      append(left.extension, [member.getText()]);
    }
  }
  for (const next of right.interfaces) {
    const current = left.interfaces.find((node) => node.name.text === next.name.text);
    if (!current) throw new Error(`本地缺少返回类型接口 ${next.name.text}`);
    const header = (node: ts.InterfaceDeclaration) => [node.modifiers?.map((item) => item.getText()), node.typeParameters?.map((item) => item.getText()), node.heritageClauses?.map((item) => item.getText())];
    if (JSON.stringify(header(current)) !== JSON.stringify(header(next))) throw new Error(`接口 ${next.name.text} 的泛型、继承或导出结构变化`);
    const group = (node: ts.InterfaceDeclaration) => {
      const result = new Map<string, ts.TypeElement[]>();
      for (const member of node.members) {
        const name = nameOf(member);
        if (name === undefined) throw new Error('接口包含动态键或复杂签名');
        result.set(name, [...(result.get(name) ?? []), member]);
      }
      return result;
    };
    const previous = group(current),
      additions: string[] = [];
    for (const [name, members] of group(next)) {
      if (!members.every(ts.isMethodSignature)) throw new Error(`目标接口成员 ${name} 不是方法`);
      const existing = previous.get(name);
      if (existing && !existing.every(ts.isMethodSignature)) throw new Error(`接口方法 ${name} 与本地属性冲突`);
      for (const member of members) checks.push({ node: member, destination: current, owner: next });
      if (existing?.map((node) => node.getText()).join('\n') === members.map((node) => node.getText()).join('\n')) continue;
      const text = members.map((node) => node.getText().replace(/[;,]?\s*$/, ';')).join(newline);
      if (existing) existing.forEach((node, index) => edits.push({ start: node.getStart(), end: node.end, text: index ? '' : text }));
      else additions.push(text);
    }
    append(current, additions);
  }
  return { edits, checks };
}
