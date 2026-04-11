import type { CamelCase, SnakeToCamelCase } from '#/global.js';

/**
 * 将camelCase字符串更改为kebab-case，用破折号替换空格并保留下划线。
 *
 * @param   {string}  str  [str description]
 * @param   {string}  replaceStr  替换的字符串
 * @return  {[type]}       [return description]
 */
export function normalizeToKebabOrSnakeCase(str: string, replaceStr = '-') {
  const STRING_DASHERIZE_REGEXP = /\s/g;
  const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
  return str.replace(STRING_DECAMELIZE_REGEXP, `$1${replaceStr}$2`).toLowerCase().replace(STRING_DASHERIZE_REGEXP, replaceStr);
}

/**
 * kebab-case/kebab_case 更改为 camelCase
 *
 * @param   {string}  str  [str description]
 *
 * @return  {[string]}       [return description]
 */
export function snakeToCamelCase<T extends string>(str: T) {
  return str.replace(/[-_]([A-Za-z])/g, function (_all, letter) {
    return letter.toUpperCase();
  }) as CamelCase<T>;
}

/**
 * 对象 key kebab-case/kebab_case 更改为 camelCase
 * @param obj
 * @returns
 */
export function snakeToCamelCaseObj<T extends Record<string, any>>(obj: T) {
  const newObj = {} as Record<string, any>;
  Object.keys(obj).forEach((key) => {
    newObj[snakeToCamelCase(key)] = obj[key];
  });
  return newObj as SnakeToCamelCase<T>;
}

/**
 * 首字母小写
 *
 * @param   {string}  str  [str description]
 *
 * @return  {[type]}       [return description]
 */
export function lowerFirstCase(str: string) {
  return str[0].toLowerCase() + str.slice(1);
}

/**
 * 首字母大写
 *
 * @param   {string}  str  [str description]
 *
 * @return  {[type]}       [return description]
 */
export function upFirstCase(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
