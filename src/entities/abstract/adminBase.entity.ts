import { ApiPropertyRule } from '@/decorators/swagger.js';
import { CreationOptional, NonAttribute } from '@sequelize/core';
import { DataTypes } from '@sequelize/core';
import { Attribute, BelongsTo, Table } from '@sequelize/core/decorators-legacy';
import { SystemAdmin } from '../systemAdmin.entity.js';
import { BaseModel } from './base.entity.js';

//AdminBaseModel 后台实体基础类
@Table.Abstract
export class AdminBaseModel<M extends AdminBaseModel<any>> extends BaseModel<M> {
  @Attribute({
    comment: '创建者(管理员)Id',
    type: DataTypes.STRING(20),
  })
  createdAdminId: CreationOptional<string>; //CreationOptional标记在模型创建过程中可以省略的属性。用于具有默认值或标记为自动生成的属性。

  @ApiPropertyRule({
    description: '创建者(管理员)',
    type: () => SystemAdmin,
  })
  @BelongsTo(() => SystemAdmin, { foreignKey: 'createdAdminId', foreignKeyConstraints: false })
  declare createdAdmin?: NonAttribute<SystemAdmin | null>;

  @Attribute({
    comment: '最后更新者(管理员)Id',
    type: DataTypes.STRING(20),
  })
  updatedAdminId: CreationOptional<string>; //CreationOptional标记在模型创建过程中可以省略的属性。用于具有默认值或标记为自动生成的属性。

  @ApiPropertyRule({
    description: '最后更新者(管理员)',
    type: () => SystemAdmin,
  })
  @BelongsTo(() => SystemAdmin, { foreignKey: 'updatedAdminId', foreignKeyConstraints: false })
  declare updatedAdmin?: NonAttribute<SystemAdmin | null>;
}
