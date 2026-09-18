import { readFileSync } from 'node:fs';
import { matchesGlob } from 'node:path';

export type SourcePolicy = 'functions' | 'exports' | false;
export type UpdateRules = { skipExisting: Record<string, boolean>; mergeSource: Record<string, SourcePolicy> };
const builtin: UpdateRules = JSON.parse(readFileSync(new URL('../../template/update.defaults.json', import.meta.url), 'utf8'));
export const defaults = builtin.skipExisting;
export const sourceDefaults = builtin.mergeSource;

export function excluded(path: string): boolean {
  const normalized = path.toLowerCase();
  return normalized.split('/').some((p) => ['.git', '.workbuddy', '.meadmin', 'node_modules', 'dist', 'logs', 'uploadfile'].includes(p)) || /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock|.*\.tsbuildinfo)$/.test(normalized);
}

/** 精确路径优先；可证明的目录子集优先；无法区分的冲突规则拒绝猜测。 */
function resolveRule<T>(path: string, rules: Record<string, T>): T | undefined {
  const entries = Object.entries(rules).filter(([pattern]) => matchesGlob(path, pattern));
  const exact = entries.find(([pattern]) => !/[?*[{]/.test(pattern));
  if (exact) return exact[1];
  const prefix = (pattern: string) => pattern.slice(0, pattern.search(/[?*[{]/));
  const within = (specific: string, broad: string) => {
    if (!broad.endsWith('/**') && !broad.endsWith('/**/*.ts')) return false;
    const broadPrefix = prefix(broad);
    return !/[?*[{]/.test(broadPrefix) && prefix(specific).startsWith(broadPrefix) && prefix(specific).length > broadPrefix.length;
  };
  const candidates = entries.filter(([pattern]) => !entries.some(([other]) => other !== pattern && within(other, pattern)));
  if (!candidates.length) return undefined;
  if (candidates.some(([, value]) => value !== candidates[0][1])) throw new Error(`规则冲突：${path}，请使用精确路径消除歧义`);
  return candidates[0][1];
}
export function skipExisting(path: string, user: Record<string, boolean> = {}): boolean {
  return resolveRule(path, { ...defaults, ...user }) ?? false;
}
export function sourceMode(path: string, user: Record<string, SourcePolicy> = {}): SourcePolicy | undefined {
  return resolveRule(path, { ...sourceDefaults, ...user });
}
export function validateConfig(value: unknown): UpdateRules {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('规则文件必须为JSON对象');
  const config = value as Record<string, unknown>;
  if (Object.keys(config).some((k) => !['skipExisting', 'mergeSource'].includes(k))) throw new Error('规则仅支持 skipExisting、mergeSource');
  const check = (name: string, allowed: unknown[]) => {
    const rules = config[name] ?? {};
    if (typeof rules !== 'object' || rules === null || Array.isArray(rules)) throw new Error(`${name} 必须为对象`);
    for (const [path, mode] of Object.entries(rules)) {
      if (!path || path.startsWith('/') || path.includes('\\') || path.includes(':') || path.split('/').some((part) => part === '..' || part === '.') || !allowed.includes(mode)) throw new Error(`${name}规则无效：${path}`);
    }
    return rules;
  };
  return { skipExisting: check('skipExisting', [true, false]) as UpdateRules['skipExisting'], mergeSource: check('mergeSource', ['functions', 'exports', false]) as UpdateRules['mergeSource'] };
}
export const validateRules = (value: unknown) => validateConfig(value).skipExisting;
