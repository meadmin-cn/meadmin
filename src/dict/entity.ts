/**
 * 函数属性
 */
export const entityFunctionProperty = [
  'hasId',
  'save',
  'remove',
  'softRemove',
  'recover',
  'reload',
] as const;
/**
 * 自动生成属性
 */
export const entityAutoProperty = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
] as const;
