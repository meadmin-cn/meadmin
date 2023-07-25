/**
 * 函数属性
 */
export const entityFunctionProperty = [
  'where',
  'getDataValue',
  'setDataValue',
  'changed',
  'previous',
  'save',
  'reload',
  'validate',
  'update',
  'destroy',
  'restore',
  'increment',
  'decrement',
  'equals',
  'equalsOneOf',
  'isSoftDeleted',
  'toJSON',
  'get',
  'set',
  'setAttributes',
] as const;

/**
 * 自动生成属性和保留属性
 */
export const entityAutoProperty = [
  'id',
  'creationDate',
  'lastUpdateDate',
  'deletionDate',
  '_attributes',
  'rawAttributes',
  'dataValues',
  '_creationAttributes',
  'isNewRecord',
  'sequelize',
] as const;
