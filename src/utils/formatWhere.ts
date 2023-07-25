import { Op } from '@sequelize/core';
import { cloneDeep } from 'lodash';
export const formatWhereOptions = {
  likeField: ['name'],
  likeFieldSuffix: ['Name'],
  betweenField: [''],
  betweenFieldSuffix: ['At'],
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
  const result = {} as Record<string, any>;
  const option = Object.assign({}, formatWhereOptions, options);
  for (const key in data) {
    if (checkField(key, option.likeField, option.likeFieldSuffix)) {
      result[key] = { [Op.like]: `%${data[key]}%` };
    } else if (
      Array.isArray(data[key]) &&
      checkField(key, option.betweenField, option.betweenFieldSuffix)
    ) {
      result[key] = { [Op.between]: data[key] };
    } else if (
      Array.isArray(data[key]) &&
      checkField(key, option.inField, option.inFieldSuffix)
    ) {
      result[key] = { [Op.in]: data[key] };
    } else if (![undefined, ''].includes(data[key])) {
      result[key] = data[key];
    }
  }
  return result;
}
