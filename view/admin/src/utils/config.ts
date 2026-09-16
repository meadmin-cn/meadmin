import type { SystemConfigDictOption, SystemConfigInfo } from '@/api/system/config.js';
import { systemConfigDictApi, systemConfigValuesApi } from '@/api/system/config.js';

/** 获取启用配置组；传入 path 时按点号读取嵌套值。 */
export async function getConfig(groupCode: string, path?: string): Promise<unknown> {
  const values = await systemConfigValuesApi({ noLoading: true, noError: true }).runAsync(groupCode);
  if (!path) return values;
  const root = Object.fromEntries((values as SystemConfigInfo[]).map((item) => [item.variableCode, item.value]));
  return path
    .split('.')
    .filter(Boolean)
    .reduce<unknown>((value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined), root);
}

/** 获取启用字典选项；服务端已经完成启用过滤和排序。 */
export async function getDict(code: string): Promise<SystemConfigDictOption[]> {
  return await systemConfigDictApi({ noLoading: true, noError: true }).runAsync(code);
}
