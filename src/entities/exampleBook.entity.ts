import { Attribute, BelongsTo, Default, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";
import { DataTypes, NonAttribute } from "@sequelize/core";
import { uuid } from "@/helper/snowflake.js";
import { ApiPropertyRule } from "@/decorators/index.js";
import { RuleType } from "@/ruleType/index.js";
import { BaseModel } from "./abstract/base.entity.js";
import { SystemAdmin } from "./systemAdmin.entity.js";

//rule规则使用添加接口的校验规则,建议字符串的默认值统一使用空串，否则RuleType.string需要显示声明allow(null)允许传入null
@Table({ tableName: 'example_book', comment: '示例_书籍' })
//继承自DelParanoidModel则使用软删除。
export class ExampleBook extends BaseModel<ExampleBook> {
  //自动生成的主键 
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: string;

  @Attribute({ type: DataTypes.STRING(20), comment: '名称', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '名称', rule: RuleType.string().max(20).min(1).required() })
  name: string;

  //声明后会自动更新创建者
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

  //声明后会自动更新更新者
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