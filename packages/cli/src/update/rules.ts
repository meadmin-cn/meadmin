import { lstatSync, readFileSync } from 'node:fs';
import { join, matchesGlob, resolve } from 'node:path';

export type SourcePolicy = 'package' | 'entity' | 'config' | 'script' | 'env' | 'yaml' | 'json' | 'npmrc' | 'ignore' | 'manual' | 'functions' | 'exports' | 'validation' | 'routes' | 'overwrite' | 'skip' | false;
export type RuleGroup<T> = Record<string, T> | false;
export type SqlOptions = { enabled: boolean; generateOnSameVersion: boolean; source: string; output: string | false; originalName: string | false };
export type UpdateRules = {
  skipExisting: RuleGroup<boolean>;
  mergeSource: RuleGroup<SourcePolicy>;
  exclude: RuleGroup<boolean>;
  autoIntegration: boolean;
  defaultPolicy: 'overwrite' | 'manual' | 'skip';
  templateMappings: RuleGroup<string | false>;
  sql: SqlOptions;
};
export type UpdateConfig = Omit<Partial<UpdateRules>, 'sql'> & { sql?: false | Partial<SqlOptions> };
const builtin = JSON.parse(readFileSync(new URL('../../template/update.defaults.json', import.meta.url), 'utf8')) as UpdateRules;
export const defaults = builtin.skipExisting;
export const sourceDefaults = builtin.mergeSource;

/** 精确路径优先；可证明的子模式优先；同层剩余冲突明确报错。 */
function resolveRule<T>(path: string, rules: Record<string, T>, ignoreCase = false): { pattern: string; value: T } | undefined {
  const normalize = (value: string) => (ignoreCase ? value.toLowerCase() : value);
  const entries = Object.entries(rules)
    .map(([pattern, value]) => ({ pattern: normalize(pattern), value }))
    .filter(({ pattern }) => pattern === '**' || matchesGlob(normalize(path), pattern));
  const exact = entries.filter(({ pattern }) => !/[?*[{(]/.test(pattern));
  const within = (specific: string, broad: string) => {
    if (broad === '**') return specific !== '**';
    if (!/[?*[{(]/.test(specific)) return matchesGlob(specific, broad);
    if (broad.startsWith('**/') && specific.startsWith('**/') && !specific.slice(3).includes('/')) return within(specific.slice(3), broad.slice(3));
    // 常见文件名通配子集，例如 .env.?* 优先于 .env*。
    if (broad.endsWith('*') && !broad.endsWith('**') && specific.startsWith(broad.slice(0, -1))) return specific.length > broad.length;
    if (!broad.endsWith('/**') && !broad.endsWith('/**/*.ts')) return false;
    const prefix = (pattern: string) => pattern.slice(0, pattern.search(/[?*[{(]/));
    return !!prefix(broad) && prefix(specific).startsWith(prefix(broad)) && prefix(specific).length > prefix(broad).length;
  };
  const candidates = exact.length ? exact : entries.filter(({ pattern }) => !entries.some((other) => other.pattern !== pattern && within(other.pattern, pattern)));
  if (!candidates.length) return undefined;
  if (candidates.some(({ value }) => value !== candidates[0].value)) throw new Error(`规则冲突：${path}，请使用精确路径消除歧义`);
  return candidates[0];
}
function layered<T>(path: string, user: RuleGroup<T>, fallback: RuleGroup<T>, ignoreCase = false): T | undefined {
  if (user === false) return undefined;
  return resolveRule(path, user, ignoreCase)?.value ?? (fallback === false ? undefined : resolveRule(path, fallback, ignoreCase)?.value);
}
export function excluded(path: string, user: RuleGroup<boolean> = {}): boolean {
  // 排除规则跨平台按大小写不敏感解析，避免 Windows 上同一路径绕过保护。
  if (user === false) return false;
  const ancestors = path.split('/').map((_, index, parts) => parts.slice(0, parts.length - index).join('/'));
  for (const rules of [user, builtin.exclude]) {
    if (rules === false) continue;
    const exactRules = Object.fromEntries(Object.entries(rules).filter(([pattern]) => !/[?*[{(]/.test(pattern)));
    for (const ancestor of ancestors) {
      const exact = resolveRule(ancestor, exactRules, true);
      if (exact) return exact.value;
    }
    for (const ancestor of ancestors) {
      const match = resolveRule(ancestor, rules, true);
      if (match) return match.value;
    }
  }
  return false;
}
export function skipExisting(path: string, user: RuleGroup<boolean> = {}): boolean {
  return layered(path, user, defaults) ?? false;
}
export function sourceMode(path: string, user: RuleGroup<SourcePolicy> = {}): SourcePolicy | undefined {
  return layered(path, user, sourceDefaults);
}
export function mappedPath(path: string, user: RuleGroup<string | false> = {}): string {
  if (user === false) return path;
  const rule = resolveRule(path, user, true) ?? (builtin.templateMappings === false ? undefined : resolveRule(path, builtin.templateMappings, true));
  if (!rule || rule.value === false) return path;
  return rule.pattern.startsWith('**/') ? path.slice(0, path.lastIndexOf('/') + 1) + rule.value : rule.value;
}
export function validRelativePath(path: string, pattern = false): boolean {
  return !!path && !path.includes('\\') && ![...path].some((char) => char.charCodeAt(0) < 32) && !/[:<>]/.test(path) && !path.startsWith('/') && path.split('/').every((part) => !!part && part !== '.' && part !== '..' && !/[ .]$/.test(part) && !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part)) && (pattern || !/[?*[\]{}|]/.test(path));
}
export function validateConfig(value: unknown): UpdateRules {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('规则文件必须为JSON对象');
  const config = value as Record<string, unknown>;
  const keys = ['skipExisting', 'mergeSource', 'exclude', 'autoIntegration', 'defaultPolicy', 'templateMappings', 'sql'];
  if (Object.keys(config).some((key) => !keys.includes(key))) throw new Error(`规则仅支持 ${keys.join('、')}`);
  const check = <T>(name: string, allowed: (value: unknown) => boolean): RuleGroup<T> => {
    const rules = Object.hasOwn(config, name) ? config[name] : {};
    if (rules === false) return false;
    if (typeof rules !== 'object' || rules === null || Array.isArray(rules)) throw new Error(`${name} 必须为对象或 false`);
    for (const [path, mode] of Object.entries(rules)) {
      if (!validRelativePath(path, true) || !allowed(mode)) throw new Error(`${name}规则无效：${path}`);
      if (name === 'templateMappings' && /[?*[{(]/.test(path) && !(path.startsWith('**/') && !/[?*[{(/]/.test(path.slice(3)))) throw new Error(`templateMappings 仅支持精确路径或 **/文件名：${path}`);
    }
    return rules as Record<string, T>;
  };
  const boolean = (value: unknown) => typeof value === 'boolean';
  const policies: unknown[] = ['package', 'entity', 'config', 'script', 'env', 'yaml', 'json', 'npmrc', 'ignore', 'manual', 'functions', 'exports', 'validation', 'routes', 'overwrite', 'skip', false];
  if (Object.hasOwn(config, 'autoIntegration') && !boolean(config.autoIntegration)) throw new Error('autoIntegration 必须为 boolean');
  if (Object.hasOwn(config, 'defaultPolicy') && !['overwrite', 'manual', 'skip'].includes(config.defaultPolicy as string)) throw new Error('defaultPolicy 必须为 overwrite、manual 或 skip');
  const sql = { ...builtin.sql };
  if (config.sql === false) sql.enabled = false;
  else if (Object.hasOwn(config, 'sql')) {
    if (!config.sql || typeof config.sql !== 'object' || Array.isArray(config.sql)) throw new Error('sql 必须为对象或 false');
    for (const [key, field] of Object.entries(config.sql)) {
      if (!['enabled', 'generateOnSameVersion', 'source', 'output', 'originalName'].includes(key)) throw new Error(`sql 配置无效：${key}`);
      if (key === 'enabled' || key === 'generateOnSameVersion' ? !boolean(field) : !(field === false && key !== 'source') && !(typeof field === 'string' && validRelativePath(key === 'originalName' ? field.replaceAll('{version}', '1.0.0') : field))) throw new Error(`sql 配置无效：${key}`);
    }
    Object.assign(sql, config.sql);
  }
  return {
    skipExisting: check<boolean>('skipExisting', boolean),
    mergeSource: check<SourcePolicy>('mergeSource', (value) => policies.includes(value)),
    exclude: check<boolean>('exclude', boolean),
    autoIntegration: (config.autoIntegration as boolean | undefined) ?? builtin.autoIntegration,
    defaultPolicy: (config.defaultPolicy as UpdateRules['defaultPolicy'] | undefined) ?? builtin.defaultPolicy,
    templateMappings: check<string | false>('templateMappings', (value) => value === false || (typeof value === 'string' && validRelativePath(value))),
    sql,
  };
}
export function loadConfig(root: string, explicit?: string): UpdateRules {
  const primary = join(root, 'update.json');
  const path = explicit ? resolve(root, explicit) : lstatSync(primary, { throwIfNoEntry: false }) ? primary : join(root, 'meadmin.update.json');
  const stat = lstatSync(path, { throwIfNoEntry: false });
  if (!stat) {
    if (explicit) throw new Error('指定规则文件不存在');
    return validateConfig({});
  }
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('规则文件路径不安全');
  return validateConfig(JSON.parse(readFileSync(path, 'utf8')));
}
export const validateRules = (value: unknown) => validateConfig(value).skipExisting;
