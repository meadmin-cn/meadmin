import { Model, BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyGetAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin, BelongsToManySetAssociationsMixin, BelongsToManyCreateAssociationMixin } from '@sequelize/core';

export type BelongsManyModel<
  AssociationName extends string, //关联字段
  SingularAssociationName extends string, //关联单数形式
  PluralAssociationName extends string, //关联负数形式
  T extends Model, //关联模型
  K = 'id', //关联模型主键key
> = {
  //获取关联信息
  [Key in `get${Capitalize<AssociationName>}`]: BelongsToManyGetAssociationsMixin<T>;
} & {
  //设置关联信息，添加新的关联之前删除旧的关联（多个）
  [Key in `set${Capitalize<AssociationName>}`]: BelongsToManySetAssociationsMixin<T, T[K]>;
} & {
  //添加新的关联关联信息，不删除旧的关联（单个）
  [Key in `add${Capitalize<SingularAssociationName>}`]: BelongsToManyAddAssociationMixin<T, T[K]>;
} & {
  //添加新的关联关联信息，不删除旧的关联（多个）
  [Key in `add${Capitalize<PluralAssociationName>}`]: BelongsToManyAddAssociationsMixin<T, T[K]>;
} & {
  //清除关联信息（单个）
  [Key in `remove${Capitalize<SingularAssociationName>}`]: BelongsToManyAddAssociationsMixin<T, T[K]>;
} & {
  //清除关联信息（多个）
  [Key in `remove${Capitalize<PluralAssociationName>}`]: BelongsToManyAddAssociationsMixin<T, T[K]>;
} & {
  //关联创建器用于创建新的关联模型并将其与源模型关联
  [Key in `create${Capitalize<AssociationName>}`]: BelongsToManyCreateAssociationMixin<T>;
} & {
  //检查是否关联（单个）
  [Key in `has${Capitalize<SingularAssociationName>}`]: BelongsToManyHasAssociationMixin<T, T[K]>;
} & {
  //检查是否关联（多个&关系）
  [Key in `has${Capitalize<PluralAssociationName>}`]: BelongsToManyHasAssociationsMixin<T, T[K]>;
} & {
  //统计关联模型数量
  [Key in `counts${Capitalize<AssociationName>}`]: BelongsToManyGetAssociationsMixin<T>;
};
