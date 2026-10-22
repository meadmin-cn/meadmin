import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

/**
 * 前台站点：按访问域名把根路径与伪静态规则映射到真实的前端路由。
 * domains 为 JSON 数组字符串，支持 `cms.example.com` 精确匹配与 `*.example.com` 通配。
 */
@Table({ tableName: 'system_site', comment: '前台站点域名绑定表' })
export class SystemSite extends AdminBaseModel<SystemSite> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>;

  @Attribute({ type: DataTypes.STRING(100), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '站点名称', rule: RuleType.string().max(100).min(1).required() })
  name: string;

  @Attribute({ type: DataTypes.TEXT, allowNull: false, defaultValue: '[]' })
  @ApiPropertyRule({ description: '绑定域名(JSON 数组字符串)', rule: RuleType.string().allow('') })
  domains: string;

  @Attribute({ type: DataTypes.STRING(500), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '根路径映射目标', rule: RuleType.string().max(500).allow('') })
  basePath: string;

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
