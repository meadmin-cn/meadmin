import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

/**
 * CMS 自定义表单提交数据。
 * 提交内容以 JSON 对象存放在 data 中（键为表单字段的 name），
 * author/contact 为便于列表展示与检索抽出的常用字段（对应表单里的称呼、联系方式）。
 */
@Table({ tableName: 'aon_cms_diyform_data', comment: 'CMS 自定义表单数据' })
export class AonCmsDiyformData extends AdminBaseModel<AonCmsDiyformData> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  // 所属表单
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @ApiPropertyRule({ description: '表单ID', rule: RuleType.string().required() })
  declare formId: string;

  // 表单标识快照，便于导出与检索
  @Attribute({ type: DataTypes.STRING(120), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '表单标识', rule: RuleType.string().max(120).allow('').default('') })
  declare diyname: string;

  // 提交内容（JSON 对象）
  @Attribute({ type: DataTypes.TEXT, allowNull: false, defaultValue: '{}' })
  @ApiPropertyRule({ description: '提交内容(JSON)', rule: RuleType.string().max(100000).allow('').default('{}') })
  declare data: string;

  // 称呼（从提交内容中抽取，便于列表展示）
  @Attribute({ type: DataTypes.STRING(80), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '称呼', rule: RuleType.string().max(80).trim().allow('').default('') })
  declare author: string;

  // 联系方式（从提交内容中抽取，仅后台可见）
  @Attribute({ type: DataTypes.STRING(160), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '联系方式', rule: RuleType.string().max(160).trim().allow('').default('') })
  declare contact: string;

  // 管理员回复（留言板场景使用）
  @Attribute({ type: DataTypes.STRING(2000), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '回复', rule: RuleType.string().max(2000).allow('').default('') })
  declare reply: string;

  // 提交来源
  @Attribute({ type: DataTypes.STRING(60), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '提交来源', rule: RuleType.string().max(60).allow('').default('') })
  declare source: string;

  // 提交 IP
  @Attribute({ type: DataTypes.STRING(60), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '提交IP', rule: RuleType.string().max(60).allow('').default('') })
  declare ip: string;

  // 状态：0待审核 1已通过 2已拒绝
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '状态：0待审核 1已通过 2已拒绝', rule: RuleType.number().integer().valid(0, 1, 2).default(0) })
  declare status: number;
}
