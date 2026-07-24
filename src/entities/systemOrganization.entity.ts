import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { BelongsToManySetAssociationsMixin, CreationOptional, DataTypes, NonAttribute } from '@sequelize/core';
import { Attribute, BelongsTo, BelongsToMany, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { AdminTreeModel } from './abstract/adminTree.entity.js';
import { SystemAdmin } from './systemAdmin.entity.js';
//rule规则使用添加接口的校验规则
@Table({ tableName: 'system_orgaization', comment: '组织表' })
export class SystemOrganization extends AdminTreeModel<SystemOrganization> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>; //CreationOptional标记在模型创建过程中可以省略的属性。用于具有默认值或标记为自动生成的属性。

  @BelongsTo(() => SystemOrganization, { foreignKey: 'parentId', foreignKeyConstraints: false }) //不创建数据库外键约束
  @ApiPropertyRule({ description: '父级', type: () => SystemOrganization })
  declare parent?: NonAttribute<SystemOrganization>;

  @Attribute({ type: DataTypes.STRING(50), comment: '组织名称', defaultValue: '', allowNull: false })
  @ApiPropertyRule({ description: '组织名称', rule: RuleType.string().max(50).min(1).required().empty('') })
  orgName: string;

  @Attribute({
    comment: '排序(降序)',
    type: DataTypes.SMALLINT,
    defaultValue: 0,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '排序(降序)', rule: RuleType.number().integer().max(9999).default(0) })
  orderNum: number;

  @Attribute({
    comment: '状态:1=启用;0=禁用',
    defaultValue: 1,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '状态:1=启用;0=禁用', rule: RuleType.number().valid(1, 0).default(1) })
  status: number;

  @Attribute({ type: DataTypes.STRING(100), comment: '备注', defaultValue: '', allowNull: false })
  @ApiPropertyRule({ description: '备注', rule: RuleType.string().max(100).min(1) })
  remark: string;

  @Attribute({ type: DataTypes.STRING(100), comment: '负责人', defaultValue: '', allowNull: false })
  @ApiPropertyRule({ description: '负责人', rule: RuleType.string().max(100).min(1) })
  leader: string;

  @Attribute({ type: DataTypes.STRING(100), comment: '联系电话', defaultValue: '', allowNull: false })
  @ApiPropertyRule({ description: '联系电话', rule: RuleType.string().phone().max(100).min(1) })
  phone: string;

  @Attribute({ type: DataTypes.STRING(100), comment: '邮箱', defaultValue: '', allowNull: false })
  @ApiPropertyRule({ description: '邮箱', rule: RuleType.string().max(100).min(1).email() })
  email: string;

  @BelongsToMany(() => SystemAdmin, {
    through: 'admin_orgaization', //中间表名称 或者 对应的Model
    inverse: {
      as: 'orgaizations',
    },
    foreignKeyConstraints: false, //数据库不创建外键，外键应用层解决
  })
  @ApiPropertyRule({
    description: '关联管理员',
    type: 'array',
    items: {
      type: () => SystemAdmin,
    },
  })
  declare admins?: NonAttribute<SystemAdmin[]>;

  setAdmins: BelongsToManySetAssociationsMixin<SystemAdmin, SystemAdmin['id']>;
}
