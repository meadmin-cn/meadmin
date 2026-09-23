import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminTreeModel } from './abstract/adminTree.entity.js';

@Table({ tableName: 'aon_cms_comment', comment: 'CMS 评论' })
export class AonCmsComment extends AdminTreeModel<AonCmsComment> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  // 文章
  @Attribute({ type: DataTypes.STRING(20), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({
    description: '文章',
    rule: RuleType.string()
      .pattern(/^[0-9]{1,20}$/)
      .required(),
  })
  declare articleId: string;

  // 树根评论没有父级
  declare parentId: string | null;

  // 登录用户身份快照，关联由服务层维护，不创建数据库外键
  @Attribute({ type: DataTypes.STRING(20), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '用户 ID', rule: RuleType.string().max(20).allow('') })
  declare userId: CreationOptional<string>;

  // 显示名称
  @Attribute({ type: DataTypes.STRING(80), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '显示名称', rule: RuleType.string().max(80).trim().min(1).required() })
  declare author: string;

  @Attribute({ type: DataTypes.STRING(1000), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '头像地址', rule: RuleType.string().max(1000).allow('') })
  declare authorAvatar: CreationOptional<string>;

  // 评论内容
  @Attribute({ type: DataTypes.STRING(2000), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '评论内容', rule: RuleType.string().max(2000).trim().min(1).required() })
  declare content: string;

  // 状态：0待审核 1展示 2关闭
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '状态：0待审核 1展示 2关闭', rule: RuleType.number().integer().valid(0, 1, 2).default(0) })
  declare status: number;

  // 举报次数和最近一次举报说明，由后台审核处理
  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 })
  @ApiPropertyRule({ description: '举报次数', rule: RuleType.number().integer().min(0).default(0) })
  declare reportCount: CreationOptional<number>;

  @Attribute({ type: DataTypes.STRING(500), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '最近一次举报说明', rule: RuleType.string().max(500).allow('') })
  declare reportReason: CreationOptional<string>;

  @Attribute({ type: DataTypes.DATE, allowNull: true, defaultValue: null })
  declare reportedAt: Date | null;
}
