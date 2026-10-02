import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

@Table({ tableName: 'aon_cms_block', comment: 'CMS 区块' })
export class AonCmsBlock extends AdminBaseModel<AonCmsBlock> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  // 名称（后台识别用，前台不展示）
  @Attribute({ type: DataTypes.STRING(200), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '名称', rule: RuleType.string().max(200).trim().min(1).required() })
  declare title: string;

  // 前台标题（前台渲染时以 title 属性的形式展示，鼠标移入可见；留空则不显示）
  @Attribute({ type: DataTypes.STRING(200), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '前台标题', rule: RuleType.string().max(200).trim().allow('').default('') })
  declare displayTitle: string;

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

  // 展示位置
  @Attribute({ type: DataTypes.STRING(100), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({
    description: '展示位置',
    rule: RuleType.string()
      .max(100)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .required(),
  })
  declare position: string;

  // 类型：1区块 2轮播 3广告
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '类型：1区块 2轮播 3广告', rule: RuleType.number().integer().valid(1, 2, 3).default(1) })
  declare kind: number;

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

  // 链接
  @Attribute({ type: DataTypes.STRING(1000), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({
    description: '链接',
    rule: RuleType.string()
      .max(1000)
      .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
      .allow('')
      .default(''),
  })
  declare link: string;

  // 状态：0禁用 1启用
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '状态：0禁用 1启用', rule: RuleType.number().integer().valid(0, 1).default(1) })
  declare status: number;

  // 开始时间
  @Attribute({ type: DataTypes.DATE, allowNull: true, defaultValue: null })
  @ApiPropertyRule({ description: '开始时间', rule: RuleType.date().iso().allow(null).default(null) })
  declare startAt: Date | null;

  // 结束时间
  @Attribute({ type: DataTypes.DATE, allowNull: true, defaultValue: null })
  @ApiPropertyRule({ description: '结束时间', rule: RuleType.date().iso().allow(null).default(null) })
  declare endAt: Date | null;

  // 排序
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '排序', rule: RuleType.number().integer().min(-9999).max(9999).default(0) })
  declare orderNum: number;

  // 配置（JSON，如热门排行规则 { sortBy, limit }）
  @Attribute({ type: DataTypes.TEXT, allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '配置(JSON)', rule: RuleType.string().max(20000).allow('').default('') })
  declare config: string;
}
