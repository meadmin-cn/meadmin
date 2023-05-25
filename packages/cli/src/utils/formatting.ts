import { resolve, relative, extname, dirname } from 'node:path';
/**
 * 将camelCase字符串更改为kebab-case，用破折号替换空格并保留下划线。
 *
 * @param   {string}  str  [str description]
 *
 * @return  {[type]}       [return description]
 */
export function normalizeToKebabOrSnakeCase(str: string) {
  const STRING_DASHERIZE_REGEXP = /\s/g;
  const STRING_DECAMELIZE_REGEXP = /([a-z\d])([A-Z])/g;
  return str
    .replace(STRING_DECAMELIZE_REGEXP, '$1-$2')
    .toLowerCase()
    .replace(STRING_DASHERIZE_REGEXP, '-');
}

/**
 * kebab-case/kebab_case 更改为 camelCase
 *
 * @param   {string}  str  [str description]
 *
 * @return  {[string]}       [return description]
 */
export function toHump(str: string) {
  return str.replace(/[\-_]([A-Za-z])/g, function (all, letter) {
    return letter.toUpperCase();
  });
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

/**
 * 获取绝对路径 并添加对应后缀
 *
 * @param   {string}       str     [str description]
 * @param   {string[]}  suffix 后缀数组
 *
 * @return  {string}
 */
export function resovePath(
  str: string,
  suffix = ['.ts'],
  base = process.cwd(),
) {
  suffix.forEach((item) => {
    if (!str.endsWith(item)) {
      str += item;
    }
  });
  return resolve(base, str).replace(/\\/g, '/');
}

/**
 * 获取相对路径并移除对应后缀
 *
 * @param   {string}       from    基础路径 允许文件路径
 * @param   {string}       to     需要获取的路径
 * @param   {string[]}  suffix  后缀
 *
 * @return  {string}
 */
export function relativePath(from: string, to: string, suffix = ['.ts']) {
  let path = relative(extname(from) ? dirname(from) : from, to);
  suffix.reverse().forEach((item) => {
    if (path.endsWith(item)) {
      path = path.slice(0, 0 - item.length);
    }
  });
  return path.replace(/\\/g, '/');
}
