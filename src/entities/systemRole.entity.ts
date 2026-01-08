import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@midwayjs/validate';
import { DataTypes, NonAttribute } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, BelongsToMany, Unique } from '@sequelize/core/decorators-legacy';
import { ApiPropertyRule } from '@/decorators/index.js';
import { SystemMenu } from './systemMenu.entity.js';
import { AdminTreeModel } from './abstract/adminTree.entity.js';
import { BelongsManyModel } from '@/types/entity.js';
import { SystemAdmin } from './systemAdmin.entity.js';

//rule规则使用添加接口的校验规则
@Table({ tableName: 'system_role', comment: '角色表' })
export class SystemRole extends AdminTreeModel<SystemRole> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: string;

  @Attribute({ type: DataTypes.STRING(50), comment: '角色名称', defaultValue: '', allowNull: false })
  @ApiPropertyRule({ description: '角色名称', rule: RuleType.string().max(50).min(1).required().empty('') })
  roleName: string;

  @Unique()
  @Attribute({ type: DataTypes.STRING(50), comment: '角色标识', defaultValue: '', allowNull: false })
  @ApiPropertyRule({ description: '角色标识', rule: RuleType.string().max(50).min(1).required().empty('') })
  roleKey: string;

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

  @BelongsToMany(() => SystemAdmin, {
    through: 'admin_role', //中间表名称 或者 对应的Model
    inverse: {
      as: 'roles',
    },
  })
  @ApiPropertyRule({
    description: '关联管理员',
    type: 'array',
    items: {
      type: () => SystemAdmin,
    },
  })
  declare admins?: NonAttribute<SystemAdmin[]>;

  @BelongsToMany(() => SystemMenu, {
    through: 'role_menu', //中间表名称 或者 对应的Model
    inverse: {//对向模型的反向关联declare字段
      as: 'roles',
    },
  })
  @ApiPropertyRule({
    description: '具有权限菜单',
    type: 'array',
    items: {
      type: () => SystemMenu,
    },
    rule: RuleType.array().items(RuleType.object({id:RuleType.string().required()})),
  })
  menus?: NonAttribute<SystemMenu[]>;
  
  @Attribute({
    comment: '超级管理员:1=是;0=不是',
    defaultValue: 0,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '超级管理员:1=是;0=不是', rule: RuleType.number().equal(1, 0).required() })
  isSuper: number;
}
//扩展BelongsManyModel方法，应只声明在一侧，避免ts 循环引用错误
export declare interface SystemRole extends BelongsManyModel<'menus', 'menu', 'menus', SystemMenu> {}
