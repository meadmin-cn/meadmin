import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminTreeModel } from './abstract/adminTree.entity.js';

@Table({ tableName: 'aon_cms_category', comment: 'CMS 栏目' })
export class AonCmsCategory extends AdminTreeModel<AonCmsCategory> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  // 名称
  @Attribute({ type: DataTypes.STRING(100), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '名称', rule: RuleType.string().max(100).trim().min(1).required() })
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

  // 状态：0禁用 1启用
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '状态：0禁用 1启用', rule: RuleType.number().integer().valid(0, 1).default(1) })
  declare status: number;

  // 排序
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '排序', rule: RuleType.number().integer().min(-9999).max(9999).default(0) })
  declare orderNum: number;

  // 栏目类型：1文章列表 2目录 3外链 4自定义表单 5单页（决定前台头部菜单的跳转行为）
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '类型：1文章列表 2目录 3外链 4自定义表单 5单页', rule: RuleType.number().integer().valid(1, 2, 3, 4, 5).default(1) })
  declare type: number;

  // 跳转链接（类型=3 跳转链接 时生效，支持外链与站内相对路径）
  @Attribute({ type: DataTypes.STRING(1000), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({
    description: '跳转链接',
    rule: RuleType.string()
      .max(1000)
      .pattern(/^(?:https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/)
      .allow('')
      .default(''),
  })
  declare linkUrl: string;

  // 跳转目标：类型=4 自定义表单时存表单 id；类型=5 单页时存单页 id（外链类型仍用 linkUrl）
  @Attribute({ type: DataTypes.STRING(200), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '跳转目标：表单/单页 id（类型 4/5 使用）', rule: RuleType.string().max(200).allow('').default('') })
  declare target: string;

  // 是否在前台头部导航显示（前台头部菜单完全由栏目驱动）
  @Attribute({ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true })
  @ApiPropertyRule({ description: '导航显示', rule: RuleType.boolean().default(true) })
  declare isNav: boolean;

  // 是否推荐栏目（前台「栏目推荐」展示）
  @Attribute({ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false })
  @ApiPropertyRule({ description: '是否推荐栏目', rule: RuleType.boolean().default(false) })
  declare isRecommend: boolean;

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
}
