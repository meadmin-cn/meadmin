import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@midwayjs/validate';
import { DataTypes, NonAttribute } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, BelongsToMany } from '@sequelize/core/decorators-legacy';
import { ApiPropertyRule } from '@/decorators/index.js';
import { Menu } from './menu.entity.js';
import { TreeModel } from './abstract/tree.entity.js';
import { BelongsManyModel } from '../../types/entity.js';

//rule规则使用添加接口的校验规则
@Table({ tableName: 'role', comment: '角色表' })
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Role extends TreeModel<Role> {
  @Attribute(DataTypes.STRING)
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: string;

  @Attribute({ type: DataTypes.STRING(50), comment: '角色名称' })
  @ApiPropertyRule({ description: '角色名称', rule: RuleType.string().max(50).min(1).required().empty('') })
  roleName: string;

  @Attribute({ type: DataTypes.STRING(50), comment: '角色标识' })
  @ApiPropertyRule({ description: '角色标识', rule: RuleType.string().max(50).min(1).required().empty('') })
  roleKey: string;

  @Attribute({
    comment: '排序(降序)',
    type: DataTypes.SMALLINT,
    defaultValue: 0,
  })
  @ApiPropertyRule({ description: '排序(降序)', rule: RuleType.number().integer().max(9999).default(0) })
  orderNum: number;

  @Attribute({
    comment: '状态:1=启用;0=禁用',
    defaultValue: 1,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '状态:1=启用;0=禁用', rule: RuleType.number().valid(1, 0).default(1) })
  status: number;

  @Attribute({ type: DataTypes.STRING(100), comment: '备注' })
  @ApiPropertyRule({ description: '备注', rule: RuleType.string().max(100).min(1) })
  remark: string;

  /** Declared by {@link Admin.roles} */
  @ApiPropertyRule({ description: '关联用户' })
  declare admins?: NonAttribute<Role[]>;

  @BelongsToMany(() => Menu, {
    through: 'role_menu', //中间表名称 或者 对应的Model
    inverse: {
      as: 'roles',
    },
  })
  @ApiPropertyRule({ description: '具有权限菜单' })
  declare menus?: NonAttribute<Menu[]>;
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface Role extends BelongsManyModel<'menus', 'menu', 'menus', Menu> {}
