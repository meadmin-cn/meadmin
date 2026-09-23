import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

@Table({ tableName: 'aon_cms_page', comment: 'CMS 单页' })
export class AonCmsPage extends AdminBaseModel<AonCmsPage> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  // 标题
  @Attribute({ type: DataTypes.STRING(200), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '标题', rule: RuleType.string().max(200).trim().min(1).required() })
  declare title: string;

  // SEO 标识
  @Attribute({ type: DataTypes.STRING(120), allowNull: false, defaultValue: '' })
  @Unique
  @ApiPropertyRule({
    description: 'SEO 标识',
    rule: RuleType.string()
      .max(120)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .required(),
  })
  declare slug: string;

  // 摘要
  @Attribute({ type: DataTypes.STRING(1000), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '摘要', rule: RuleType.string().max(1000).allow('').default('') })
  declare summary: string;

  // Markdown 内容
  @Attribute({ type: DataTypes.TEXT, allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: 'Markdown 内容', rule: RuleType.string().max(200000).allow('').default('') })
  declare mdContent: string;

  // 封面
  @Attribute({ type: DataTypes.STRING(1000), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({
    description: '封面',
    rule: RuleType.string()
      .max(1000)
      .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
      .allow('')
      .default(''),
  })
  declare coverUrl: string;

  // SEO 标题
  @Attribute({ type: DataTypes.STRING(200), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: 'SEO 标题', rule: RuleType.string().max(200).allow('').default('') })
  declare seoTitle: string;

  // SEO 关键词
  @Attribute({ type: DataTypes.STRING(200), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: 'SEO 关键词', rule: RuleType.string().max(200).allow('').default('') })
  declare seoKeywords: string;

  // SEO 描述
  @Attribute({ type: DataTypes.STRING(500), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: 'SEO 描述', rule: RuleType.string().max(500).allow('').default('') })
  declare seoDescription: string;

  // 状态：0草稿 1待审核 2发布 3拒绝 4下线
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '状态：0草稿 1待审核 2发布 3拒绝 4下线', rule: RuleType.number().integer().valid(0, 1, 2, 3, 4).default(0) })
  declare status: number;

  // 发布时间
  @Attribute({ type: DataTypes.DATE, allowNull: true, defaultValue: null })
  @ApiPropertyRule({ description: '发布时间', rule: RuleType.date().iso().allow(null).default(null) })
  declare publishAt: Date | null;

  // 排序
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '排序', rule: RuleType.number().integer().min(-9999).max(9999).default(0) })
  declare orderNum: number;
}
