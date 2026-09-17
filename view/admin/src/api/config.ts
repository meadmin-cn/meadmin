import request from '@/utils/request.js';

export type PublicConfigValue = unknown;
export type PublicDictOption = { value: string | number; label: string };

const cacheTime = 1000 * 60 * 5;

/** 公开读取启用配置；path 支持点号路径，省略时返回配置项数组。 */
export function getConfigApi<T = PublicConfigValue>() {
  return request<T, [string, string?]>(
    (code, path) => ({
      baseURL: '/api/index/',
      headers: { Authorization: false },
      url: `config/value/${encodeURIComponent(code)}`,
      method: 'get',
      params: path ? { path } : undefined,
    }),
    {
      noLoading: true,
      cacheTime,
      cacheKey: (params) => 'admin:getConfigApi|' + JSON.stringify(params),
    },
  );
}

/** 公开读取字典；服务端过滤禁用选项并按排序值升序返回。 */
export function getDictApi() {
  return request<PublicDictOption[], [string]>(
    (code) => ({
      baseURL: '/api/index/',
      headers: { Authorization: false },
      url: `config/dict/${encodeURIComponent(code)}`,
      method: 'get',
    }),
    {
      noLoading: true,
      cacheTime,
      cacheKey: (params) => 'admin:getDictApi|' + JSON.stringify(params),
    },
  );
}
