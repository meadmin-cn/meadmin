import { Attribute, BelongsTo, Table } from "@sequelize/core/decorators-legacy";
import { BaseModel } from "./base.entity.js";
import { ApiPropertyRule } from "@/decorators/index.js";
import { DataTypes, NonAttribute } from "@sequelize/core";
import { User } from "../user.entity.js";

//IndexBaseModel 前台台实体基础类
@Table.Abstract
export class IndexBaseModel<M extends IndexBaseModel<any>> extends BaseModel<M> {

   @ApiPropertyRule({
    description: '创建者Id',
    type: 'string',
  })
  @Attribute({
    comment: '创建者Id(用户)',
    type: DataTypes.STRING(20),
  })
  createdUserId: string;

  @ApiPropertyRule({
    description: '创建者',
    type: () => User,
  })
  @BelongsTo(() => User, 'createdUserId')
  declare createdUser?: NonAttribute<User>;

  @Attribute({
    comment: '更新者Id(管理员)',
    type: DataTypes.STRING(20),
  })
  updatedUserId: string;

  @ApiPropertyRule({
    description: '最后更新者',
    type: () => User,
  })
  @BelongsTo(() => User, 'updatedUserId')
  declare updatedUser?: NonAttribute<User>;
}