import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, NonAttribute } from '@sequelize/core';
import { DataTypes } from '@sequelize/core';
import { Attribute, BelongsTo, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminTreeModel } from './abstract/adminTree.entity.js';
import { SystemRole } from './systemRole.entity.js';

//rule规则使用添加接口的校验规则
@Table({ tableName: 'system_menu', comment: '菜单表' })
export class SystemMenu extends AdminTreeModel<SystemMenu> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>;//CreationOptional 是 Sequelize 提供的一个类型，用于表示在创建实例时可以省略的属性，因为它们会由数据库自动生成或有默认值。

  @BelongsTo(() => SystemMenu, { foreignKey: 'parentId', foreignKeyConstraints: false }) //不创建数据库外键约束
  @ApiPropertyRule({ description: '父级', type: () => SystemMenu })
  declare parent?: NonAttribute<SystemMenu>;

  @Attribute({
    comment: '菜单名称',
    type: DataTypes.STRING(100),
    defaultValue: '',
    allowNull: false,
  })
  @ApiPropertyRule({ description: '菜单名称', rule: RuleType.string().max(100).required() })
  title: string;

  @Attribute({
    comment: '类型:1=目录;2=菜单;3=按钮',
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '类型:1=目录;2=菜单;3=按钮', rule: RuleType.number().valid(1, 2, 3).required() })
  menuType: number;

  @Attribute({
    comment: '状态:1=启用;0=禁用',
    defaultValue: 1,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '状态:1=启用;0=禁用', rule: RuleType.number().valid(1, 0) })
  status: number;

  @Unique()
  @Attribute({
    comment: '权限',
    type: DataTypes.STRING(100),
    defaultValue: '',
    allowNull: false,
  })
  @ApiPropertyRule({ description: '权限', rule: RuleType.string().max(100).required() })
  rule: string;

  @Attribute({
    comment: '排序(降序)',
    type: DataTypes.SMALLINT,
    defaultValue: 0,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '排序(降序)', rule: RuleType.number().integer().max(9999) })
  orderNum: number;

  @Attribute({
    comment: '路径',
    type: DataTypes.STRING(500),
    defaultValue: '',
    allowNull: false,
  })
  @ApiPropertyRule({
    description: '路径',
    rule: RuleType.string()
      .max(500)
      .when('menuType', { is: 2, then: RuleType.required().not(null) }),
  })
  path: string;

  @Attribute({
    comment: '外链:1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '外链:1=是;0=否', rule: RuleType.number().valid(0, 1) })
  isLink: number;

  @Attribute({
    comment: '组件路径(相对于views文件夹)',
    type: DataTypes.STRING(500),
    defaultValue: '',
    allowNull: false,
  })
  @ApiPropertyRule({
    description: '组件路径(相对于views文件夹)',
    rule: RuleType.string()
      .max(500)
      .when('menuType', { is: 2, then: RuleType.when('isUrl', { is: 0, then: RuleType.required().not(null) }) }),
  })
  component: string;

  @Attribute({
    comment: '隐藏:1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '隐藏:1=是;0=否', rule: RuleType.number().valid(0, 1) })
  hideMenu: number;

  @Attribute({
    comment: '缓存:1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '缓存:1=是;0=否', rule: RuleType.number().valid(0, 1) })
  cache: number;

  @Attribute({
    comment: '图标',
    type: DataTypes.STRING(50),
    defaultValue: '',
    allowNull: false,
  })
  @ApiPropertyRule({ description: '图标', rule: RuleType.string().max(50) })
  icon: string;

  @Attribute({
    comment: '固定tag:1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '固定tag:1=是;0=否', rule: RuleType.number().valid(0, 1) })
  affix: number;

  @Attribute({
    comment: '恒定展示(只有一个子元素时不隐藏):1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '恒定展示(只有一个子元素时不隐藏):1=是;0=否', rule: RuleType.number().valid(0, 1) })
  alwaysShow: number;

  @Attribute({
    comment: '面包屑:1=展示;0=不展示',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 1,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '面包屑:1=展示;0=不展示', rule: RuleType.number().valid(0, 1) })
  breadcrumb: number;

  /** Declared by {@link SystemRole.menus} */
  //具有当前菜单的角色
  declare roles?: NonAttribute<SystemRole[]>;
}
