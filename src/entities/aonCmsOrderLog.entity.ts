import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

export type CmsOrderAction = 'create' | 'edit' | 'pay' | 'ship' | 'receive' | 'follow' | 'complete' | 'close' | 'refund';

@Table({ tableName: 'aon_cms_order_log', comment: 'CMS 订单跟进日志' })
export class AonCmsOrderLog extends AdminBaseModel<AonCmsOrderLog> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  declare id: CreationOptional<string>;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  declare orderId: string;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false, defaultValue: 'follow' })
  declare action: CmsOrderAction;

  @Attribute({ type: DataTypes.STRING(1000), allowNull: false, defaultValue: '' })
  declare content: string;

  @Attribute({ type: DataTypes.DATE, allowNull: true })
  declare nextFollowAt: CreationOptional<Date | null>;
}
