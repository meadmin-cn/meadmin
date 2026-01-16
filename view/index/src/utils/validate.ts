/**
 * 是否是外链
 * @param path
 * @returns
 */
export function isExternal(path: string) {
  return /^(https?:|mailto:|tel:)/.test(path);
}

/**
 * 是否是手机号
 * @param value
 * @returns
 */
export function isMobile(value: string | number) {
  return /^1\d{10}$/.test(value + '');
}
