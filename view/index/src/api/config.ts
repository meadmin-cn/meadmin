import request from '@/utils/request.js';

export type PublicConfigValue = unknown;
export type PublicDictOption = { value: string | number; label: string };

/** 获取启用配置；传入 path 时按点号读取嵌套值。 */
export function getConfigApi<T = PublicConfigValue>() {
  return request<T, [string, string?]>(
    (code, deepPath) => ({
      url: `config/value/${encodeURIComponent(code)}`,
      method: 'get',
      params: deepPath ? { path: deepPath } : undefined,
    }),
    { noLoading: true, cacheTime: 1000 * 60 * 5, cacheKey: (params: any) => 'getConfigApi|' + JSON.stringify(params) },
  );
}

/** 获取启用字典选项；服务端已过滤禁用项并按 sort 升序排列。 */
export function getDictApi() {
  return request<PublicDictOption[], [string]>(
    (code: string) => ({
      url: `config/dict/${encodeURIComponent(code)}`,
      method: 'get',
    }),
    { noLoading: true, cacheTime: 1000 * 60 * 5, cacheKey: (params: any) => 'getDictApi|' + JSON.stringify(params) },
  );
}
