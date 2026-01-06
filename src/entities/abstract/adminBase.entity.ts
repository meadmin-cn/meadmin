import { Attribute, BelongsTo, Table } from "@sequelize/core/decorators-legacy";
import { BaseModel } from "./base.entity.js";
import { DataTypes, NonAttribute } from "@sequelize/core";
import { ApiPropertyRule } from "@/decorators/swagger.js";
import { SystemAdmin } from "../systemAdmin.entity.js";

//AdminBaseModel 后台实体基础类
@Table.Abstract
export class AdminBaseModel<M extends AdminBaseModel<any>> extends BaseModel<M> {

  @Attribute({
    comment: '创建者Id(管理员)',
    type: DataTypes.STRING(20),
  })
  createdAdminId: string;

  @ApiPropertyRule({
    description: '创建者',
    type: () => SystemAdmin,
  })
  @BelongsTo(() => SystemAdmin, 'createdAdminId')
  declare createdAdmin?: NonAttribute<SystemAdmin | null>;

  @Attribute({
    comment: '更新者Id(管理员)',
    type: DataTypes.STRING(20),
  })
  updatedAdminId: string;

  @ApiPropertyRule({
    description: '最后更新者',
    type: () => SystemAdmin,
  })
  @BelongsTo(() => SystemAdmin, 'updatedAdminId')
  declare updatedAdmin?: NonAttribute<SystemAdmin  | null>;
}