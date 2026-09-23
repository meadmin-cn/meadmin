import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

@Table({ tableName: 'aon_cms_order', comment: 'CMS 线下订单' })
export class AonCmsOrder extends AdminBaseModel<AonCmsOrder> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  @Attribute({ type: DataTypes.STRING(32), allowNull: false, unique: true })
  @ApiPropertyRule({ description: '订单号', rule: RuleType.string().max(32).required() })
  declare orderNo: string;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  declare articleId: string;

  @Attribute({ type: DataTypes.STRING(20), allowNull: true })
  declare userId: string | null;

  @Attribute({ type: DataTypes.STRING(80), allowNull: false })
  declare contactName: string;

  @Attribute({ type: DataTypes.STRING(30), allowNull: false })
  declare contactPhone: string;

  @Attribute({ type: DataTypes.STRING(500), allowNull: false })
  declare shippingAddress: string;

  @Attribute({ type: DataTypes.STRING(160), allowNull: false })
  declare itemName: string;

  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 })
  declare quantity: number;

  @Attribute({ type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 })
  declare amount: string;

  // 订单状态：0待处理 1处理中 2已完成 3已关闭
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  declare status: number;

  // 线下支付状态：0待线下支付 1已确认 2已取消
  @Attribute({ type: DataTypes.SMALLINT, allowNull: false, defaultValue: 0 })
  declare paymentStatus: number;

  @Attribute({ type: DataTypes.STRING(500), allowNull: false, defaultValue: '' })
  declare remark: string;
}
