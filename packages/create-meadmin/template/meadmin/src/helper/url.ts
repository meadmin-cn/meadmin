type QueryValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryValue | QueryValue[]>;

/**
 * 将 URL 和 query 对象拼接为完整的请求地址,对于数组类型 会重复拼接
 * @param baseUrl - 基础 URL（可带或不带已有查询参数）
 * @param query   - 查询参数对象
 * @returns 拼接后的完整 URL 字符串
 */
export function buildUrl(baseUrl: string, query?: QueryParams): string {
  if (!query || Object.keys(query).length === 0) {
    return baseUrl;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    // 过滤掉 null / undefined
    if (value == null) continue;

    if (Array.isArray(value)) {
      // 数组参数：同一 key 追加多次，如 ?tag=a&tag=b
      for (const item of value) {
        if (item != null) {
          params.append(key, String(item));
        }
      }
    } else {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  if (!queryString) return baseUrl;

  // 判断 baseUrl 是否已经包含 '?'
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${queryString}`;
}
