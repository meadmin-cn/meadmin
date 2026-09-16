import request from '@/utils/request.js';

export type PublicConfigValue = unknown;
export type PublicDictOption = { value: string | number; label: string };

/** 获取启用配置；传入 path 时按点号读取嵌套值。 */
export function getConfig(groupCode: string, path?: string) {
  return request<PublicConfigValue, [string, string?]>((code, deepPath) => ({ url: `config/value/${code}`, method: 'get', params: deepPath ? { path: deepPath } : undefined }), { noLoading: true })(groupCode, path);
}

/** 获取启用字典选项；服务端已过滤禁用项并按 sort 升序排列。 */
export function getDict(code: string) {
  return request<PublicDictOption[], [string]>(() => ({ url: `config/dict/${code}`, method: 'get' }), { noLoading: true })(code);
}
