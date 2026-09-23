import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

@Table({ tableName: 'aon_cms_download', comment: 'CMS 下载资源' })
export class AonCmsDownload extends AdminBaseModel<AonCmsDownload> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false }) @PrimaryKey @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() }) declare id: CreationOptional<string>;
  @Attribute({ type: DataTypes.STRING(200), allowNull: false }) declare title: string;
  @Attribute({ type: DataTypes.STRING(120), allowNull: false }) @Unique declare slug: string;
  @Attribute({ type: DataTypes.STRING(80), allowNull: false, defaultValue: '' }) declare category: string;
  @Attribute({ type: DataTypes.STRING(50), allowNull: false, defaultValue: '' }) declare version: string;
  @Attribute({ type: DataTypes.STRING(1000), allowNull: false, defaultValue: '' }) declare summary: string;
  @Attribute({ type: DataTypes.TEXT, allowNull: false, defaultValue: '' }) declare mdContent: string;
  @Attribute({ type: DataTypes.STRING(1000), allowNull: false, defaultValue: '' }) declare coverUrl: string;
  @Attribute({ type: DataTypes.STRING(1000), allowNull: false }) declare fileUrl: string;
  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }) declare downloads: CreationOptional<number>;
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 }) declare status: number;
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 }) declare orderNum: number;
}
