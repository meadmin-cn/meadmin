import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

@Table({ tableName: 'aon_cms_topic', comment: 'CMS 专题' })
export class AonCmsTopic extends AdminBaseModel<AonCmsTopic> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  // 名称
  @Attribute({ type: DataTypes.STRING(200), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '名称', rule: RuleType.string().max(200).trim().min(1).required() })
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

  // 状态：0禁用 1启用
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '状态：0禁用 1启用', rule: RuleType.number().integer().valid(0, 1).default(1) })
  declare status: number;

  // 排序
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '排序', rule: RuleType.number().integer().min(-9999).max(9999).default(0) })
  declare orderNum: number;

  // 内容类型：1内置内容(本页 Markdown) 2外链 3文章 4自定义表单 5目录(栏目) 6单页
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '内容类型：1内置内容 2外链 3文章 4自定义表单 5目录 6单页', rule: RuleType.number().integer().valid(1, 2, 3, 4, 5, 6).default(1) })
  declare type: number;

  // 关联目标：类型=2 时为外链地址；类型=3/4/5/6 时为对应记录的 ID
  @Attribute({ type: DataTypes.STRING(200), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '关联目标：外链地址或文章/表单/栏目/单页的 ID', rule: RuleType.string().max(200).allow('').default('') })
  declare target: string;

  // 外链打开方式：0当前窗口 1新窗口（仅类型=2 生效）
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '外链打开方式：0当前窗口 1新窗口', rule: RuleType.number().integer().valid(0, 1).default(0) })
  declare targetBlank: number;
}
