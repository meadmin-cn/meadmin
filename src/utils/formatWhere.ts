import { cloneDeep } from 'lodash';
import { Between, In } from 'typeorm';
export const formatWhereOptions = {
  likeField: ['name'],
  likeFieldSuffix: ['Name'],
  betweenField: ['name'],
  betweenFieldSuffix: ['name'],
  inField: ['ids'],
  inFieldSuffix: ['s'],
};

export type FormatWhereOptions = Partial<typeof formatWhereOptions>;

/**
 * 检测是否符合字段规则
 *
 * @param   {string}              name    字段名
 * @param   {FormatWhereOptions}  field  [options description]
 * @param   {FormatWhereOptions}  suffix  [options description]
 *
 * @return  {boolean}   [return description]
 */
function checkField(name: string, field?: string[], suffix?: string[]) {
  if (field && field.includes(name)) {
    return true;
  }
  if (suffix && suffix.some((item) => name.endsWith(item))) {
    return true;
  }
  return false;
}

/**
 * 格式化typeOrm where对象
 * @param data where对象
 * @param [options]
 * @returns 格式化后的where对象
 */
export function formatWhere(
  data: Record<string, any>,
  options?: FormatWhereOptions,
) {
  const result = cloneDeep(data);
  const option = Object.assign({}, formatWhere, options);
  for (const key in result) {
    if (checkField(key, option.likeField, option.likeFieldSuffix)) {
      result[key] = `%${result[key]}%`;
    } else if (
      checkField(key, option.betweenField, option.betweenFieldSuffix)
    ) {
      result[key] = Between(...(result[key] as [string, string]));
    } else if (checkField(key, option.inField, option.inFieldSuffix)) {
      result[key] = In(result[key]);
    }
  }
  return result;
}
