import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

/**
 * 站点伪静态规则：pattern 为对外暴露的 URL 模式，target 为真实前端路由。
 * 两者均使用 Vue Router 参数语法，例如 `/product/:slug` → `/aon/cms/category/:slug`。
 */
@Table({ tableName: 'system_rewrite', comment: '站点伪静态规则表' })
export class SystemRewrite extends AdminBaseModel<SystemRewrite> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @ApiPropertyRule({ description: '站点ID', rule: RuleType.string().required() })
  siteId: string;

  @Attribute({ type: DataTypes.STRING(500), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: 'URL 模式', rule: RuleType.string().max(500).required() })
  pattern: string;

  @Attribute({ type: DataTypes.STRING(500), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '目标前端路由', rule: RuleType.string().max(500).required() })
  target: string;

  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '状态：1启用，0禁用', rule: RuleType.number().integer().valid(0, 1) })
  status: number;

  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '排序值', rule: RuleType.number().integer().min(0) })
  orderNum: number;

  @Attribute({ type: DataTypes.STRING(500), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '备注', rule: RuleType.string().max(500).allow('') })
  remark: string;
}
