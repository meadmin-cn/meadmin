import { ApiPropertyRule } from '@/decorators/index.js';
import { DataTypes, NonAttribute } from '@sequelize/core';
import { Attribute, BelongsTo, Table } from '@sequelize/core/decorators-legacy';
import { User } from '../user.entity.js';
import { AdminBaseModel } from './adminBase.entity.js';

//IndexBaseModel 前台台实体基础类
@Table.Abstract
export class IndexBaseModel<M extends IndexBaseModel<any>> extends AdminBaseModel<M> {
  @ApiPropertyRule({
    description: '创建者(用户)Id',
    type: 'string',
  })
  @Attribute({
    comment: '创建者(用户)Id',
    type: DataTypes.STRING(20),
  })
  createdUserId: string | null;

  @ApiPropertyRule({
    description: '创建者(用户)',
    type: () => User,
  })
  @BelongsTo(() => User, { foreignKey: 'createdUserId', foreignKeyConstraints: false })
  declare createdUser?: NonAttribute<User>;

  @Attribute({
    comment: '最后更新者(用户)Id',
    type: DataTypes.STRING(20),
  })
  updatedUserId: string | null;

  @ApiPropertyRule({
    description: '最后更新者(用户)',
    type: () => User,
  })
  @BelongsTo(() => User, { foreignKey: 'updatedUserId', foreignKeyConstraints: false })
  declare updatedUser?: NonAttribute<User>;
}
