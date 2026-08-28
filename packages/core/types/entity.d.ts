import { Op } from '@sequelize/core';
import { WhereAttributeHash } from '@sequelize/core/_non-semver-use-at-your-own-risk_/abstract-dialect/where-sql-builder-types.js';

type AllowNotOrAndWithImplicitAndArrayRecursive<T> = T & {
  [Op.or]: any;
} & {
  [Op.and]: any;
} & {
  [Op.not]: any;
};
export type NormalWhereOptions<TAttributes> = AllowNotOrAndWithImplicitAndArrayRecursive<WhereAttributeHash<TAttributes>>; //seqlize 对应的where类型过于复杂，无法使用，使用自定义类型表示常用的where类型
