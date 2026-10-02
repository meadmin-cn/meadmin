import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

/**
 * CMS 自定义表单定义。
 * 字段结构以 JSON 数组存放在 fields 中，每项形如：
 * { name, label, type: text|textarea|number|select|radio|checkbox|date|image, required, options, placeholder, maxlength }
 * 前台按 fields 渲染表单，提交数据写入 aon_cms_diyform_data。
 */
@Table({ tableName: 'aon_cms_diyform', comment: 'CMS 自定义表单' })
export class AonCmsDiyform extends AdminBaseModel<AonCmsDiyform> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  // 表单名称
  @Attribute({ type: DataTypes.STRING(100), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '表单名称', rule: RuleType.string().max(100).trim().min(1).required() })
  declare title: string;

  // 表单标识（前台按标识取表单）
  @Attribute({ type: DataTypes.STRING(120), allowNull: false, defaultValue: '' })
  @Unique
  @ApiPropertyRule({
    description: '表单标识',
    rule: RuleType.string()
      .max(120)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .required(),
  })
  declare diyname: string;

  // 说明
  @Attribute({ type: DataTypes.STRING(500), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '说明', rule: RuleType.string().max(500).trim().allow('').default('') })
  declare description: string;

  // 字段配置（JSON 数组）
  @Attribute({ type: DataTypes.TEXT, allowNull: false, defaultValue: '[]' })
  @ApiPropertyRule({ description: '字段配置(JSON)', rule: RuleType.string().max(50000).allow('').default('[]') })
  declare fields: string;

  // 提交按钮文案
  @Attribute({ type: DataTypes.STRING(60), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '提交按钮文案', rule: RuleType.string().max(60).trim().allow('').default('') })
  declare submitText: string;

  // 是否需要审核（1 审核后公开，0 直接公开）
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '提交数据是否需要审核：0否 1是', rule: RuleType.number().integer().valid(0, 1).default(1) })
  declare needReview: number;

  // 是否作为前台留言板使用（同一站点只允许一个）
  @Attribute({ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false })
  @ApiPropertyRule({ description: '是否前台留言板', rule: RuleType.boolean().default(false) })
  declare isMessageBoard: boolean;

  // 状态：0禁用 1启用
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '状态：0禁用 1启用', rule: RuleType.number().integer().valid(0, 1).default(1) })
  declare status: number;

  // 排序
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '排序', rule: RuleType.number().integer().min(-9999).max(9999).default(0) })
  declare orderNum: number;
}
