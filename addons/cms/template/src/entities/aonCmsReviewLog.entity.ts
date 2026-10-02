import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

@Table({ tableName: 'aon_cms_review_log', comment: 'CMS 审核历史' })
export class AonCmsReviewLog extends AdminBaseModel<AonCmsReviewLog> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @ApiPropertyRule({ description: '内容 ID', rule: RuleType.string().pattern(/^[0-9]{1,20}$/).required() })
  declare contentId: string;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @ApiPropertyRule({ description: '内容类型', rule: RuleType.string().valid('article', 'page', 'comment').required() })
  declare contentType: 'article' | 'page' | 'comment';

  @Attribute({ type: DataTypes.SMALLINT, allowNull: false })
  declare fromStatus: number;

  @Attribute({ type: DataTypes.SMALLINT, allowNull: false })
  declare toStatus: number;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  declare action: 'submit' | 'approve' | 'reject' | 'offline';

  @Attribute({ type: DataTypes.STRING(1000), allowNull: false, defaultValue: '' })
  declare reason: string;

  @Attribute({ type: DataTypes.TEXT, allowNull: true })
  @ApiPropertyRule({ description: '内容快照（审核时的完整内容 JSON，含名称/摘要/是否可下载等）', rule: RuleType.string().allow(null, '') })
  declare snapshot: string | null;
}
