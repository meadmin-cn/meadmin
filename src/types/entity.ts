import {
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToSetAssociationMixin,
  CreationAttributes,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  InferAttributesOptions,
  Model,
} from '@sequelize/core';
import { AnyFunction } from '@sequelize/utils';

export type HasOneModel<
  AssociationName extends string, //关联字段
  T extends Model, //关联模型
  ForeignKey extends keyof CreationAttributes<T> = never, //外键
  K extends keyof T = 'id' extends keyof T ? 'id' : never, //关联模型主键key
> = {
  //获取关联信息
  [Key in `get${Capitalize<AssociationName>}`]: HasOneGetAssociationMixin<T>;
} & {
  //设置关联信息
  [Key in `set${Capitalize<AssociationName>}`]: HasOneSetAssociationMixin<T, T[K]>;
} & {
  //创建关联信息
  [Key in `create${Capitalize<AssociationName>}`]: HasOneCreateAssociationMixin<T, ForeignKey>;
};

export type HasManyModel<
  AssociationName extends string, //关联字段
  SingularAssociationName extends string, //关联单数形式
  PluralAssociationName extends string, //关联复数形式
  T extends Model, //关联模型
  ForeignKey extends keyof CreationAttributes<T> = never, //外键
  K extends keyof T = 'id' extends keyof T ? 'id' : never, //关联模型主键key
> = {
  //获取关联信息
  [Key in `get${Capitalize<AssociationName>}`]: HasManyGetAssociationsMixin<T>;
} & {
  //设置关联信息，添加新的关联之前删除旧的关联（多个）
  [Key in `set${Capitalize<AssociationName>}`]: HasManySetAssociationsMixin<T, T[K]>;
} & {
  //添加新的关联关联信息，不删除旧的关联（单个）
  [Key in `add${Capitalize<SingularAssociationName>}`]: HasManyAddAssociationMixin<T, T[K]>;
} & {
  //添加新的关联关联信息，不删除旧的关联（多个）
  [Key in `add${Capitalize<PluralAssociationName>}`]: HasManyAddAssociationsMixin<T, T[K]>;
} & {
  //清除关联信息（单个）
  [Key in `remove${Capitalize<SingularAssociationName>}`]: HasManyRemoveAssociationMixin<T, T[K]>;
} & {
  //清除关联信息（多个）
  [Key in `remove${Capitalize<PluralAssociationName>}`]: HasManyRemoveAssociationsMixin<T, T[K]>;
} & {
  //关联创建器用于创建新的关联模型并将其与源模型关联
  [Key in `create${Capitalize<AssociationName>}`]: HasManyCreateAssociationMixin<T, ForeignKey>;
} & {
  //检查是否关联（单个）
  [Key in `has${Capitalize<SingularAssociationName>}`]: HasManyHasAssociationMixin<T, T[K]>;
} & {
  //检查是否关联（多个&关系）
  [Key in `has${Capitalize<PluralAssociationName>}`]: HasManyHasAssociationsMixin<T, T[K]>;
} & {
  //统计关联模型数量
  [Key in `counts${Capitalize<AssociationName>}`]: HasManyCountAssociationsMixin<T>;
};

export type BelongsToModel<
  AssociationName extends string, //关联字段
  T extends Model, //关联模型
  K extends keyof T = 'id' extends keyof T ? 'id' : never, //关联模型主键key
> = {
  //获取关联信息
  [Key in `get${Capitalize<AssociationName>}`]: BelongsToGetAssociationMixin<T>;
} & {
  //设置关联信息
  [Key in `set${Capitalize<AssociationName>}`]: BelongsToSetAssociationMixin<T, T[K]>;
} & {
  //关联创建器用于创建新的关联模型并将其与源模型关联
  [Key in `create${Capitalize<AssociationName>}`]: BelongsToCreateAssociationMixin<T>;
};
export type BelongsManyModel<
  AssociationName extends string, //关联字段
  SingularAssociationName extends string, //关联单数形式
  PluralAssociationName extends string, //关联复数形式
  T extends Model, //关联模型
  K extends keyof T = 'id' extends keyof T ? 'id' : never, //关联模型主键key
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

/**
 * @private
 * {@link InferAttributesLoose} 使用的内部类型，用于排除* 以下属性：
 * - functions
 * - 继承自 {@link Model}
 * - 使用 {@link InferAttributesOptions} 的 omit 选项手动排除
 */
type InternalInferAttributeKeysFromFieldsLoose<M extends Model, Key extends keyof M, Options extends InferAttributesOptions<keyof M | ''>> =
  // fields inherited from Model are all excluded
  Key extends keyof Model
    ? never
    : // functions are always excluded
      M[Key] extends AnyFunction
      ? never
      : // : // fields branded with NonAttribute are excluded
        //   IsBranded<M[Key], typeof NonAttributeBrand> extends true
        //   ? never
        // check 'omit' option is provided & exclude those listed in it
        Options['omit'] extends string
        ? Key extends Options['omit']
          ? never
          : Key
        : Key;
/**
 * 用于提取给定模型类属性的实用类型(宽松的不会排除{@link NonAttribute}标记的属性)。
 *
 * 它返回模型中定义的所有实例属性，但不包括：
 * - 从模型继承的属性（中间继承有效），
 * - 类型为函数的属性，
 * - 使用第二个参数手动排除的属性。
 *
 *  使用 {@link NonAttribute} 会正常再里边没有排除
 * 它无法检测某个属性是否是 getter，你应该使用 `Excluded` 参数将 getter 和 setter 从属性列表中排除。
 *
 * @example
 * ```javascript
 * // listed attributes will be 'id' & 'firstName'.
 * class User extends Model<InferAttributes<User>> {
 *   id: number;
 *   firstName: string;
 * }
 * ```
 *
 * @example
 * ```javascript
 * // listed attributes will be 'id' & 'firstName'.
 * // we're excluding the `name` getter & `projects` attribute using the `omit` option.
 * class User extends Model<InferAttributes<User, { omit: 'name' | 'projects' }>> {
 *   id: number;
 *   firstName: string;
 *
 *   // this is an association, it should not be listed in attributes
 *   projects?: Project[];
 * }
 * ```
 *
 * @example
 * ```javascript
 * // listed attributes will be 'id' & 'firstName'.
 * // we're excluding the `name` getter & `test` attribute using the `NonAttribute` branded type.
 * class User extends Model<InferAttributes<User>> {
 *   id: number;
 *   firstName: string;
 *
 *   // this is a getter function, not an attribute. It should not be listed in attributes.
 *   get name(): string { return this.firstName; }
 * }
 * ```
 */
export type InferAttributesLoose<M extends Model, Options extends InferAttributesOptions<keyof M | ''> = { omit: never }> = {
  [Key in keyof M as InternalInferAttributeKeysFromFieldsLoose<M, Key, Options>]: M[Key];
};
