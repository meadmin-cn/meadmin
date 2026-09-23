import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

@Table({ tableName: 'aon_cms_article', comment: 'CMS 文章' })
export class AonCmsArticle extends AdminBaseModel<AonCmsArticle> {
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

  // 栏目
  @Attribute({ type: DataTypes.STRING(20), allowNull: true, defaultValue: null })
  @ApiPropertyRule({
    description: '栏目',
    rule: RuleType.string()
      .pattern(/^[0-9]{1,20}$/)
      .allow(null)
      .default(null),
  })
  declare categoryId: string | null;

  // 专题
  @Attribute({ type: DataTypes.STRING(20), allowNull: true, defaultValue: null })
  @ApiPropertyRule({
    description: '专题',
    rule: RuleType.string()
      .pattern(/^[0-9]{1,20}$/)
      .allow(null)
      .default(null),
  })
  declare topicId: string | null;

  // 标签
  @Attribute({ type: DataTypes.ARRAY(DataTypes.STRING(20)), allowNull: false, defaultValue: [] })
  @ApiPropertyRule({
    description: '标签',
    rule: RuleType.array()
      .items(RuleType.string().pattern(/^[0-9]{1,20}$/))
      .unique()
      .max(30)
      .default([]),
  })
  declare tagIds: string[];

  // 阅读量
  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '阅读量', rule: RuleType.number().integer().min(0).default(0) })
  declare views: CreationOptional<number>;

  // 点赞数
  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '点赞数', rule: RuleType.number().integer().min(0).default(0) })
  declare likes: CreationOptional<number>;

  // 评论数（由已审核评论维护）
  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '评论数', rule: RuleType.number().integer().min(0).default(0) })
  declare comments: CreationOptional<number>;

  // 是否允许在内容详情页创建线下订单
  @Attribute({ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false })
  @ApiPropertyRule({ description: '是否启用订单', rule: RuleType.boolean().default(false) })
  declare orderEnabled: CreationOptional<boolean>;
}
