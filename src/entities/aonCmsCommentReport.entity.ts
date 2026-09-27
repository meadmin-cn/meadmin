import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

@Table({ tableName: 'aon_cms_comment_report', comment: 'CMS 评论举报记录' })
export class AonCmsCommentReport extends AdminBaseModel<AonCmsCommentReport> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false, defaultValue: '' })
  declare commentId: string;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false, defaultValue: '' })
  declare articleId: string;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false, defaultValue: '' })
  declare userId: CreationOptional<string>;

  @Attribute({ type: DataTypes.STRING(500), allowNull: false, defaultValue: '' })
  declare reason: string;
}
