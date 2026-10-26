import type { RouteRecordRaw } from 'vue-router';
import { resolvePath } from './index';

export type SiteRule = {
  /** 原始 URL 模式（含 nginx 修饰符），仅用于展示 */
  pattern: string;
  /** 目标前端路由模板，正则分组为 :p1、:p2… */
  target: string;
  /** 服务端按 nginx 语法编译好的 Vue Router alias 模板；旧配置可能缺省 */
  alias?: string;
  modifier?: string;
  kind?: string;
};
export type SiteConfig = {
  basePath?: string;
  rules?: SiteRule[];
};

type SiteRoute = RouteRecordRaw & { alias?: string | string[]; children?: SiteRoute[] };

const trimPath = (value: string) => {
  const trimmed = (value || '').replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
};

/** 规则实际生效的 alias 模板：优先用服务端编译结果，兼容旧配置直接写 pattern */
const ruleAlias = (rule: SiteRule) => trimPath(rule.alias ?? rule.pattern);

const aliasList = (alias: SiteRoute['alias']): string[] => (Array.isArray(alias) ? alias : alias ? [alias] : []);

/**
 * 规范化站点配置：过滤非法规则、按 alias 去重。
 * 只要声明了根路径映射（basePath）就是一份有效配置 —— 该前缀下的所有前端路由
 * 都会自动对外去掉前缀，无需逐条配置规则。
 */
export function normalizeSiteConfig(config: unknown): SiteConfig | null {
  if (!config || typeof config !== 'object') return null;
  const source = config as Record<string, unknown>;
  const rawBasePath = typeof source.basePath === 'string' ? trimPath(source.basePath.trim()) : '';
  const basePath = rawBasePath === '/' ? '' : rawBasePath;
  const rules: SiteRule[] = [];
  if (Array.isArray(source.rules)) {
    for (const item of source.rules) {
      if (!item || typeof item !== 'object') continue;
      const rule = item as Record<string, unknown>;
      if (typeof rule.pattern !== 'string' || typeof rule.target !== 'string') continue;
      const pattern = rule.pattern.trim();
      const target = rule.target.trim();
      const alias = typeof rule.alias === 'string' ? rule.alias.trim() : pattern;
      // 目标路由必须是前端真实路由，alias 必须是绝对路径（正则模式已由服务端编译为路径模板）
      if (!target.startsWith('/') || !alias.startsWith('/')) continue;
      rules.push({
        pattern,
        alias: trimPath(alias),
        target: trimPath(target),
        modifier: typeof rule.modifier === 'string' ? rule.modifier : undefined,
        kind: typeof rule.kind === 'string' ? rule.kind : undefined,
      });
    }
  }
  const seen = new Set<string>();
  const deduped = rules.filter((rule) => {
    const key = ruleAlias(rule);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!deduped.length && !basePath) return null;
  return { basePath, rules: deduped };
}

/**
 * 解析服务端传入的站点配置：home.controller 以 JSON 字符串注入 assign.siteConfig，
 * 同时兼容直接传对象（其他渲染入口）。
 */
export function parseSiteConfig(value: unknown): SiteConfig | null {
  if (typeof value === 'string') {
    if (!value.trim()) return null;
    try {
      return normalizeSiteConfig(JSON.parse(value));
    } catch {
      return null;
    }
  }
  return normalizeSiteConfig(value);
}

/**
 * 读取服务端注入的站点配置：SSR 使用 globalThis，浏览器使用 window。
 */
export function readSiteConfig(): SiteConfig | null {
  const raw = import.meta.env.SSR ? globalThis.__SITE_CONFIG__ : typeof window === 'undefined' ? undefined : window.__siteConfig;
  return normalizeSiteConfig(raw);
}

const ALIGN_PARAM = /^:([A-Za-z0-9_]+)(?:\((.*)\))?$/;

/**
 * 把规则的目标路由模板与真实路由 fullPath 对齐。
 * 完全一致时返回空映射；否则按路径段位置对齐参数名 —— 正则规则编译出来的 `:p1`
 * 需要换成真实路由上的参数名（如 `:slug`），alias 才能挂到该路由上。
 */
const alignTarget = (fullPath: string, target: string): Record<string, string> | null => {
  if (trimPath(fullPath) === trimPath(target)) return {};
  const targetSegments = trimPath(target).split('/').filter(Boolean);
  const routeSegments = trimPath(fullPath).split('/').filter(Boolean);
  if (targetSegments.length !== routeSegments.length) return null;
  const mapping: Record<string, string> = {};
  for (let index = 0; index < targetSegments.length; index++) {
    const targetSegment = targetSegments[index];
    const routeSegment = routeSegments[index];
    if (!targetSegment.startsWith(':')) {
      if (targetSegment !== routeSegment) return null;
      continue;
    }
    const targetParam = ALIGN_PARAM.exec(targetSegment);
    const routeParam = ALIGN_PARAM.exec(routeSegment);
    if (!targetParam || !routeParam) return null;
    mapping[targetParam[1]] = routeParam[1];
  }
  return mapping;
};

/** 按对齐结果把 alias 模板里的参数改名 */
const renameAlias = (alias: string, mapping: Record<string, string>) => {
  if (!Object.keys(mapping).length) return alias;
  return alias.replace(/:([A-Za-z0-9_]+)/g, (matched, name: string) => (mapping[name] && mapping[name] !== name ? `:${mapping[name]}` : matched));
};

/**
 * 根路径映射派生：内部路由 fullPath 去掉 basePath 就是对外地址。
 * 返回该路由可用的对外路径（可能有多条，如 `/index` 同时对外暴露为 `/` 和 `/index`），
 * 不在 basePath 下时返回 null。
 */
const deriveSitePaths = (fullPath: string, basePath: string): string[] | null => {
  const current = trimPath(fullPath);
  const base = trimPath(basePath);
  if (!base || base === '/') return null;
  if (current !== base && !current.startsWith(base + '/')) return null;
  const rest = current === base ? '/' : current.slice(base.length);
  if (!rest || rest === '/') return ['/'];
  // index 段在对外地址里省略：/aon/cms/user/index → /user（CMS 首页本身已是 /aon/cms，不再走这条）
  if (rest === '/index') return ['/', '/index'];
  if (rest.endsWith('/index')) return [rest.slice(0, -'/index'.length), rest];
  return [rest];
};

/** 把对外路径挂到指定路由的 alias 上，自身路径与重复项跳过 */
const addAlias = (record: SiteRoute, alias: string, fullPath: string) => {
  const value = trimPath(alias);
  if (!value.startsWith('/') || value === trimPath(fullPath)) return;
  const aliases = aliasList(record.alias);
  if (aliases.some((item) => trimPath(item) === value)) return;
  record.alias = [...aliases, value];
};

/**
 * 挂载站点别名，两个来源：
 * 1. 根路径映射派生的默认别名 —— basePath 下所有前端路由自动对外去掉前缀，无需逐条配置；
 * 2. 后台伪静态规则 —— 只用于特例（如给内容页追加 .html、跨前缀改写）。
 * 必须在路由树 clone 之后、formatRoutes 之前调用（此时子路由 path 仍为相对路径）。
 */
export function applySiteAliases(routes: RouteRecordRaw[], config: SiteConfig | null): RouteRecordRaw[] {
  const site = normalizeSiteConfig(config);
  if (!site) return routes;
  const basePath = site.basePath ?? '';
  const rules = site.rules ?? [];
  if (!basePath && !rules.length) return routes;
  const visit = (records: SiteRoute[], parentPath: string) => {
    for (const record of records) {
      const fullPath = resolvePath(record.path, parentPath);
      for (const rule of rules) {
        const mapping = alignTarget(fullPath, rule.target);
        if (!mapping) continue;
        addAlias(record, renameAlias(ruleAlias(rule), mapping), fullPath);
      }
      // 布局父路由（basePath 本身且有子路由）不挂别名，站点首页交给 path 为空的那个子路由
      const isLayoutRoot = Boolean(basePath) && trimPath(fullPath) === trimPath(basePath) && Boolean(record.children?.length);
      if (basePath && !isLayoutRoot) {
        for (const alias of deriveSitePaths(fullPath, basePath) ?? []) {
          // 重定向记录（如 /aon/cms/index → /aon/cms）不抢站点根路径，避免与首页别名冲突；
          // 但 /index 这类次级别名保留，旧地址仍能落到重定向上
          if (record.redirect && trimPath(alias) === '/') continue;
          addAlias(record, alias, fullPath);
        }
      }
      if (record.children?.length) visit(record.children, fullPath);
    }
  };
  visit(routes as SiteRoute[], '');
  return routes;
}

/** 判断路由树中是否已挂载站点 alias。 */
export function hasSiteAlias(route: RouteRecordRaw): boolean {
  const record = route as SiteRoute;
  if (aliasList(record.alias).length) return true;
  return Boolean(record.children?.some((child) => hasSiteAlias(child)));
}

/**
 * 站点路由必须优先注册，否则以 `/` 为别名的站点首页会被框架默认首页先命中。
 * 只调整注册顺序，不改变数组本身（meta.menuIndex 已在 formatRoutes 中按原顺序生成）。
 */
export function prioritizeSiteRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  const siteRoutes = routes.filter((route) => hasSiteAlias(route));
  if (!siteRoutes.length || siteRoutes.length === routes.length) return routes;
  const otherRoutes = routes.filter((route) => !hasSiteAlias(route));
  return [...siteRoutes, ...otherRoutes];
}

const SEGMENT_PARAM = /^:([A-Za-z0-9_]+)(?:\((.*)\))?$/;
const TEMPLATE_PARAM = /:([A-Za-z0-9_]+)(?:\([^)]*\))?/g;

const matchTarget = (target: string, path: string): Record<string, string> | null => {
  const targetSegments = trimPath(target).split('/').filter(Boolean);
  const pathSegments = trimPath(path).split('/').filter(Boolean);
  if (targetSegments.length !== pathSegments.length) return null;
  const params: Record<string, string> = {};
  for (let index = 0; index < targetSegments.length; index++) {
    const targetSegment = targetSegments[index];
    const pathSegment = pathSegments[index];
    if (targetSegment.startsWith(':')) {
      const matched = SEGMENT_PARAM.exec(targetSegment);
      if (!matched) return null;
      const [, name, pattern] = matched;
      if (pattern) {
        try {
          if (!new RegExp(`^(?:${pattern})$`).test(decodeURIComponent(pathSegment))) return null;
        } catch {
          return null;
        }
      }
      params[name] = pathSegment;
      continue;
    }
    if (targetSegment !== pathSegment) return null;
  }
  return params;
};

const fillPattern = (pattern: string, params: Record<string, string>): string | null => {
  let missing = false;
  const filled = pattern.replace(TEMPLATE_PARAM, (_matched, name: string) => {
    if (params[name] === undefined) {
      missing = true;
      return '';
    }
    return params[name];
  });
  return missing ? null : filled;
};

/**
 * 生成内部路径 → 对外地址的反向映射。用于把站内跳转（如 CMS 生成的 /aon/cms/... 链接）
 * 保持为伪静态地址，避免点击后地址栏跳回真实路由。
 * 根路径映射派生优先，规则只兜底特例，这样站内链接始终保持去前缀的规范地址。
 */
export function createSitePathMapper(config: SiteConfig | null): ((path: string) => string | null) | null {
  const site = normalizeSiteConfig(config);
  if (!site) return null;
  const basePath = site.basePath ?? '';
  const rules = site.rules ?? [];
  if (!basePath && !rules.length) return null;
  return (path: string) => {
    const current = trimPath(path);
    if (basePath) {
      const derived = deriveSitePaths(current, basePath);
      if (derived?.length) {
        const mapped = trimPath(derived[0]);
        return mapped === current ? null : mapped;
      }
    }
    for (const rule of rules) {
      const params = matchTarget(rule.target, current);
      if (!params) continue;
      const mapped = fillPattern(ruleAlias(rule), params);
      if (mapped && trimPath(mapped) !== current) return mapped;
    }
    return null;
  };
}
