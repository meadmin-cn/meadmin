import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes, NonAttribute } from '@sequelize/core';
import { Attribute, BelongsTo, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';
import { SystemConfigGroup } from './systemConfigGroup.entity.js';

export type SystemConfigVariableType = 'string' | 'number' | 'textarea' | 'multiline' | 'text' | 'array' | 'keyvalue' | 'dict';
export type SystemConfigOption = {
  value: string | number;
  label: string;
  sort: number;
  status: number;
};

@Table({ tableName: 'system_config', comment: '系统配置项表' })
export class SystemConfig extends AdminBaseModel<SystemConfig> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>;

  @Unique('system_config_group_variable_code_unique')
  @Attribute({ type: DataTypes.STRING(100), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '变量名/code', rule: RuleType.string().max(100).min(1).required() })
  variableCode: string;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false, defaultValue: 'string' })
  @ApiPropertyRule({ description: '变量类型', rule: RuleType.string().valid('string', 'number', 'textarea', 'multiline', 'text', 'array', 'keyvalue', 'dict').required() })
  variableType: SystemConfigVariableType;

  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 100 })
  @ApiPropertyRule({ description: '排序值', rule: RuleType.number().integer().min(0) })
  sortOrder: number;

  @Attribute({ type: DataTypes.STRING(100), allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '变量标题', rule: RuleType.string().max(100).min(1).required() })
  variableTitle: string;

  @Attribute({ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false })
  @ApiPropertyRule({ description: '是否内置', rule: RuleType.boolean() })
  isBuiltin: boolean;

  @Unique('system_config_group_variable_code_unique')
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @ApiPropertyRule({ description: '分组ID', rule: RuleType.string().required() })
  groupId: string;

  @BelongsTo(() => SystemConfigGroup, { foreignKey: 'groupId', foreignKeyConstraints: false })
  @ApiPropertyRule({ description: '配置分组', type: () => SystemConfigGroup })
  declare group?: NonAttribute<SystemConfigGroup>;

  @Attribute({ type: DataTypes.TEXT, allowNull: true, defaultValue: null })
  @ApiPropertyRule({ description: '配置值', rule: RuleType.any() })
  value: string | null;

  @Attribute({ type: DataTypes.JSONB, allowNull: false, defaultValue: [] })
  @ApiPropertyRule({ description: '字典选项', type: 'array', items: { type: 'object' }, rule: RuleType.array().items(RuleType.object()) })
  options: SystemConfigOption[];

  @Attribute({ type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false })
  @ApiPropertyRule({ description: '是否必填', rule: RuleType.boolean() })
  isRequired: boolean;

  @Attribute({ type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 })
  @ApiPropertyRule({ description: '状态：1启用，0禁用', rule: RuleType.number().integer().valid(0, 1) })
  status: number;

  @Attribute({ type: DataTypes.TEXT, allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '说明', rule: RuleType.string().allow('') })
  description: string;
}
