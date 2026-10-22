/**
 * 伪静态 URL 模式编译器。
 *
 * 目标：让配置页可以使用 nginx location 风格的模糊匹配写法，而前端仍然拿到
 * Vue Router 可以直接使用的 alias 路径模板 —— 这样地址栏保留用户访问的伪静态地址，
 * 路由命中的是真实前端路由（如 /aon/cms/...），两者互不影响。
 *
 * 支持的修饰符（与 nginx 语义一致）：
 *   =   /path               精确匹配
 *   ^~  /path               前缀优先匹配（同结构化路径，优先级高于正则）
 *   ~   ^/article/(\d+)$    正则匹配，捕获分组依次映射为 :p1、:p2…
 *   ~*  ^/article/(\d+)$    同上，忽略大小写（Vue Router 路由匹配默认不区分大小写）
 *   无   /category/:slug     结构化路径匹配
 *
 * 目标路由对正则分组使用 $1、$2 引用（也可以直接写 :p1、:p2）。
 * 注意：Vue Router 的 alias 只能是路径模板，无法直接承载任意正则，因此
 * 正则中的通配必须放进捕获分组，编译器会把它转成 :pN(字符类) 的形式。
 */

/** 匹配修饰符 */
export type RewriteModifier = '' | '=' | '^~' | '~' | '~*';
/** 匹配类型 */
export type RewriteMatchKind = 'prefix' | 'exact' | 'regex';

/** 编译后的规则：alias 交给路由做别名，target 用于反向映射回伪静态地址 */
export type CompiledRewrite = {
  /** 原始写法（含修饰符） */
  pattern: string;
  modifier: RewriteModifier;
  /** 去掉修饰符后的表达式 */
  expr: string;
  kind: RewriteMatchKind;
  /** Vue Router alias 路径模板，正则分组为 :p1、:p2… */
  alias: string;
  /** 目标前端路由模板，正则分组为 :p1、:p2… */
  target: string;
};

export type CompileResult = { ok: true; rule: CompiledRewrite } | { ok: false; error: string };

export type CompileRulesResult = {
  rules: CompiledRewrite[];
  errors: Array<{ pattern: string; target: string; error: string }>;
};

/** 修饰符按长度降序，保证 ~* 不会被 ~ 抢先匹配 */
const MODIFIERS: RewriteModifier[] = ['~*', '^~', '~', '='];

/** 拆出修饰符与表达式 */
export function splitRewritePattern(raw: string): { modifier: RewriteModifier; expr: string } {
  const value = (raw ?? '').trim();
  for (const modifier of MODIFIERS) {
    if (value.startsWith(modifier)) return { modifier, expr: value.slice(modifier.length).trim() };
  }
  return { modifier: '', expr: value };
}

/** 修饰符的中文说明，用于后台列表展示 */
export function rewriteModifierLabel(modifier: RewriteModifier): string {
  switch (modifier) {
    case '=':
      return '精确匹配';
    case '^~':
      return '前缀优先';
    case '~':
      return '正则匹配';
    case '~*':
      return '正则匹配（忽略大小写）';
    default:
      return '路径匹配';
  }
}

const modifierKind = (modifier: RewriteModifier): RewriteMatchKind => {
  if (modifier === '=') return 'exact';
  if (modifier === '~' || modifier === '~*') return 'regex';
  return 'prefix';
};

const trimPath = (value: string) => {
  const trimmed = (value ?? '').replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
};

const fail = (error: string): CompileResult => ({ ok: false, error });

/**
 * 分组内部的转义翻译。字符类内外的语义不同：
 * 字符类内 \d 是 0-9，字符类外需要包成 [0-9]。
 * 返回 null 表示不支持。
 */
const translateEscape = (next: string | undefined, inClass: boolean): string | null => {
  if (!next) return null;
  if (next === 'd') return inClass ? '0-9' : '[0-9]';
  if (next === 'w') return inClass ? 'A-Za-z0-9_' : '[A-Za-z0-9_]';
  if (next === '.') return '\\.';
  if (next === '-') return '\\-';
  if (next === '/') return inClass ? '/' : null;
  if ('_~=&%+.,:'.includes(next)) return next;
  return null;
};

/**
 * 把捕获分组的正则内容翻译成 Vue Router 参数正则。
 * Vue Router 的参数正则不能跨路径段，所以这里拒绝 . / 顶层通配等写法。
 */
const translateGroupInner = (inner: string): string | null => {
  if (!inner) return null;
  // 非捕获分组、前瞻、后顾、命名分组统一不支持
  if (inner.startsWith('?')) return null;
  let out = '';
  let index = 0;
  let inClass = false;
  let classLength = 0;
  while (index < inner.length) {
    const ch = inner[index];
    if (ch === '\\') {
      const translated = translateEscape(inner[index + 1], inClass);
      if (translated === null) return null;
      out += translated;
      if (inClass) classLength += 1;
      index += 2;
      continue;
    }
    if (inClass) {
      if (ch === ']') {
        if (!classLength) return null;
        inClass = false;
        out += ch;
      } else if (ch === '[') {
        return null;
      } else {
        out += ch;
        classLength += 1;
      }
      index += 1;
      continue;
    }
    if (ch === '[') {
      inClass = true;
      classLength = 0;
      out += ch;
      index += 1;
      continue;
    }
    if (ch === ']' || ch === '(' || ch === ')' || ch === '.' || ch === '^' || ch === '$' || ch === '/') return null;
    out += ch;
    index += 1;
  }
  if (inClass) return null;
  try {
    const probe = new RegExp(`^(?:${out})$`);
    // 能匹配空串的分组没有意义，还会让别名匹配到空路径段
    if (probe.test('')) return null;
  } catch {
    return null;
  }
  return out;
};

/** 从 start 处的左括号找到配对的右括号，跳过转义与字符类 */
const readGroup = (body: string, start: number): { inner: string; end: number } | null => {
  let depth = 0;
  let index = start;
  let inClass = false;
  let classLength = 0;
  while (index < body.length) {
    const ch = body[index];
    if (ch === '\\') {
      index += 2;
      continue;
    }
    if (inClass) {
      if (ch === ']') {
        if (!classLength) return null;
        inClass = false;
      } else if (ch !== '[') {
        classLength += 1;
      }
      index += 1;
      continue;
    }
    if (ch === '[') {
      inClass = true;
      classLength = 0;
      index += 1;
      continue;
    }
    if (ch === '(') {
      depth += 1;
      index += 1;
      continue;
    }
    if (ch === ')') {
      depth -= 1;
      if (depth === 0) return { inner: body.slice(start + 1, index), end: index };
      index += 1;
      continue;
    }
    index += 1;
  }
  return null;
};

/** 把目标路由里的 $1、$2 换成 :p1、:p2 */
const buildRegexTarget = (alias: string, rawTarget: string, groups: number): CompileResult => {
  let value = (rawTarget ?? '').trim();
  let referenceError = '';
  value = value.replace(/\$([1-9])/g, (_matched, digit: string) => {
    const index = Number(digit);
    if (index > groups) {
      referenceError = `目标路由引用了不存在的捕获分组 $${digit}，当前 URL 模式共 ${groups} 个分组`;
      return '';
    }
    return `:p${index}`;
  });
  if (referenceError) return fail(referenceError);
  if (!value.startsWith('/')) return fail('目标路由必须以 / 开头');
  for (const matched of value.matchAll(/:p(\d+)/g)) {
    if (Number(matched[1]) > groups) return fail(`目标路由引用了不存在的捕获分组 :p${matched[1]}`);
  }
  return { ok: true, rule: { pattern: '', modifier: '', expr: '', kind: 'regex', alias, target: trimPath(value) } };
};

/** 正则模式：编译成 Vue Router 参数路径 */
const compileRegexRule = (modifier: RewriteModifier, rawExpr: string, target: string): CompileResult => {
  let body = rawExpr;
  if (body.startsWith('^')) body = body.slice(1);
  if (body.endsWith('$') && !body.endsWith('\\$')) body = body.slice(0, -1);
  if (body.startsWith('\\/')) body = body.slice(1);
  if (!body.startsWith('/')) return fail(`正则模式需要使用 ^/ 或 / 开头，例如：${modifier} ^/article/([0-9]+)\\.html$`);
  let alias = '';
  let index = 0;
  let groups = 0;
  while (index < body.length) {
    const ch = body[index];
    if (ch === '\\') {
      const next = body[index + 1];
      if (next === '.') {
        alias += '.';
        index += 2;
        continue;
      }
      if (next === '-') {
        alias += '-';
        index += 2;
        continue;
      }
      if (next === '_') {
        alias += '_';
        index += 2;
        continue;
      }
      if (next === '/') {
        alias += '/';
        index += 2;
        continue;
      }
      return fail(`正则顶层不支持转义 \\${next ?? ''}，通配符请放进捕获分组，例如 ([0-9]+)`);
    }
    if (ch === '(') {
      const group = readGroup(body, index);
      if (!group) return fail('正则括号不匹配');
      const inner = translateGroupInner(group.inner);
      if (inner === null) return fail(`不支持的分组 (${group.inner})：分组内只能使用字符类、字面量与 + * ? 量词，且不能跨路径段`);
      groups += 1;
      // [^/]+ 正好是 Vue Router 参数的默认匹配规则，省略后别名更直观
      alias += inner === '[^/]+' ? `:p${groups}` : `:p${groups}(${inner})`;
      index = group.end + 1;
      continue;
    }
    if ('*+?{}|[]'.includes(ch)) return fail(`正则顶层不支持 ${ch}，通配符请放进捕获分组`);
    if (ch === '.' || ch === '^' || ch === '$' || ch === ':') return fail(`正则顶层不支持 ${ch}，请转义为字面量或放进捕获分组`);
    alias += ch;
    index += 1;
  }
  if (!groups) return fail('正则模式至少需要一个捕获分组，例如 ^/article/([0-9]+)\\.html$');
  const built = buildRegexTarget(alias, target, groups);
  if (!built.ok) return built;
  // 目标路由写成 /aon/cms/article/:slug 这种具名参数时，分组数量与之相同就沿用它的参数名，
  // 让编译结果保持可读（/article/:slug.html 而不是 /article/:p1.html）
  let finalAlias = alias;
  let finalTarget = built.rule.target;
  const named = Array.from(finalTarget.matchAll(/:([A-Za-z0-9_]+)/g)).map((matched) => matched[1]);
  if (named.length === groups && named.every((name) => /^p\d+$/.test(name) === false)) {
    const rename = (value: string) =>
      value.replace(/:p(\d+)/g, (_matched, digit: string) => {
        const name = named[Number(digit) - 1];
        return name ? `:${name}` : `:p${digit}`;
      });
    finalAlias = rename(finalAlias);
    finalTarget = rename(finalTarget);
  }
  return { ok: true, rule: { ...built.rule, modifier, alias: finalAlias, target: finalTarget, kind: 'regex' } };
};

/** 结构化路径：alias 直接使用书写顺序，参数名需与目标路由一致 */
const compileStructuralRule = (modifier: RewriteModifier, expr: string, target: string): CompileResult => {
  if (!expr.startsWith('/')) return fail('URL 模式必须以 / 开头；如果需要写正则，请使用 ~ 或 ~* 修饰符');
  const alias = trimPath(expr);
  const value = (target ?? '').trim();
  if (!value.startsWith('/')) return fail('目标路由必须以 / 开头');
  for (const matched of alias.matchAll(/:([A-Za-z0-9_]+)/g)) {
    const name = matched[1];
    // 反向映射（站内跳转保持伪静态地址）依赖参数名一一对应
    if (!new RegExp(`:${name}(?![A-Za-z0-9_])`).test(value)) {
      return fail(`目标路由缺少参数 :${name}，URL 模式与目标路由的参数名必须一致`);
    }
  }
  return {
    ok: true,
    rule: { pattern: '', modifier, expr, kind: modifierKind(modifier), alias, target: trimPath(value) },
  };
};

/** 编译单条规则 */
export function compileRewriteRule(pattern: string, target: string): CompileResult {
  const { modifier, expr } = splitRewritePattern(pattern);
  if (!expr) return fail('URL 模式不能为空');
  const result = modifier === '~' || modifier === '~*' ? compileRegexRule(modifier, expr, target) : compileStructuralRule(modifier, expr, target);
  if (!result.ok) return result;
  return { ok: true, rule: { ...result.rule, pattern: (pattern ?? '').trim(), expr } };
}

/** nginx 优先级：= > ^~ > 正则（按配置顺序）> 普通前缀（越长越优先） */
const modifierWeight = (modifier: RewriteModifier): number => {
  if (modifier === '=') return 0;
  if (modifier === '^~') return 1;
  if (modifier === '~' || modifier === '~*') return 2;
  return 3;
};

/**
 * 批量编译并按 nginx 优先级排序；无法编译的规则会被剔除并单独返回，便于后台提示。
 */
export function compileRewriteRules(rules: Array<{ pattern: string; target: string; orderNum?: number }>): CompileRulesResult {
  const compiled: Array<{ rule: CompiledRewrite; orderNum: number }> = [];
  const errors: CompileRulesResult['errors'] = [];
  for (const item of rules) {
    const result = compileRewriteRule(item.pattern, item.target);
    if (result.ok) compiled.push({ rule: result.rule, orderNum: item.orderNum ?? 0 });
    else errors.push({ pattern: item.pattern, target: item.target, error: result.error });
  }
  compiled.sort((left, right) => {
    const weightGap = modifierWeight(left.rule.modifier) - modifierWeight(right.rule.modifier);
    if (weightGap !== 0) return weightGap;
    const orderGap = left.orderNum - right.orderNum;
    // 正则按配置顺序；前缀/精确按表达式长度降序，长前缀先匹配
    if (left.rule.kind === 'regex') return orderGap;
    return right.rule.expr.length - left.rule.expr.length || orderGap;
  });
  return { rules: compiled.map((item) => item.rule), errors };
}
