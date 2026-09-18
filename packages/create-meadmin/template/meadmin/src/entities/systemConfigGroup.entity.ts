import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes, NonAttribute } from '@sequelize/core';
import { Attribute, Default, HasMany, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';
import { SystemConfig } from './systemConfig.entity.js';

@Table({ tableName: 'system_config_group', comment: '系统配置分组表' })
export class SystemConfigGroup extends AdminBaseModel<SystemConfigGroup> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>;

  @Unique()
  @Attribute({ type: DataTypes.STRING(50), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({
    description: '分组编码',
    rule: RuleType.string()
      .pattern(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/)
      .max(50)
      .min(1)
      .required(),
  })
  groupCode: string;

  @Attribute({ type: DataTypes.STRING(100), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '分组名称', rule: RuleType.string().max(100).min(1).required() })
  groupName: string;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false, defaultValue: 'custom' })
  @ApiPropertyRule({ description: '分组类型:base=基础;dict=字典;custom=自定义', rule: RuleType.string().valid('base', 'dict', 'custom').required() })
  groupType: 'base' | 'dict' | 'custom';

  @Attribute({ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false })
  @ApiPropertyRule({ description: '是否内置', rule: RuleType.boolean() })
  isBuiltin: boolean;

  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 })
  @ApiPropertyRule({ description: '排序值', rule: RuleType.number().integer().min(0) })
  sortOrder: number;

  @Attribute({ type: DataTypes.TEXT, allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '说明', rule: RuleType.string().allow('') })
  description: string;

  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '状态：1启用，0禁用', rule: RuleType.number().integer().valid(0, 1) })
  status: number;

  @HasMany(() => SystemConfig, { foreignKey: 'groupId', foreignKeyConstraints: false })
  @ApiPropertyRule({ description: '配置项', type: 'array', items: { type: () => SystemConfig } })
  declare configs?: NonAttribute<SystemConfig[]>;
}
