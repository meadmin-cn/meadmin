import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

@Table({ tableName: 'aon_cms_message', comment: 'CMS 留言' })
export class AonCmsMessage extends AdminBaseModel<AonCmsMessage> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;
  @Attribute({ type: DataTypes.STRING(80), allowNull: false }) declare author: string;
  @Attribute({ type: DataTypes.STRING(120), allowNull: false, defaultValue: '' }) declare contact: string;
  @Attribute({ type: DataTypes.STRING(2000), allowNull: false }) declare content: string;
  @Attribute({ type: DataTypes.STRING(2000), allowNull: false, defaultValue: '' }) declare reply: string;
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 }) declare status: number;
}
