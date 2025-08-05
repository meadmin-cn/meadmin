import { uuid } from '@/helper/snowflake.js';
import { ApiProperty } from '@midwayjs/swagger';
import { Rule } from '@midwayjs/validate';
import { RuleType } from '@/ruleType/index.js';
import { DataTypes, NonAttribute } from '@sequelize/core';
import { Attribute, PrimaryKey, Default, DeletedAt, Table, BelongsToMany } from '@sequelize/core/decorators-legacy';
import { ApiPropertyRule } from '@/decorators/index.js';
import { BaseModel } from './abstract/base.entity.js';
import { Role } from './role.entity.js';
import { BelongsManyModel } from '../../types/entity.js';
import { Menu } from './menu.entity.js';

//rule规则使用添加接口的校验规则
@Table({ tableName: 'admin', comment: '管理员表' })
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class Admin extends BaseModel<Admin> {
  @Attribute(DataTypes.STRING)
  @PrimaryKey
  @Default(uuid)
  @Rule(RuleType.string())
  @ApiProperty({ description: 'ID' })
  id: string;

  @Attribute({ type: DataTypes.STRING(50), comment: '用户名', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '用户名', rule: RuleType.string().max(50).min(1).required().empty('') })
  username: string;

  @Attribute({ type: DataTypes.STRING(20), comment: '昵称', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '昵称', rule: RuleType.string().max(20).min(1).required() })
  nickname: string;

  @Attribute({ type: DataTypes.STRING(64), comment: '密码', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '密码', rule: RuleType.string().required() })
  password: string;

  @Attribute({ type: DataTypes.STRING(32), comment: '密码盐', allowNull: false, defaultValue: '' })
  salt: string;

  @Attribute({ type: DataTypes.STRING(100), comment: '头像', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '头像', rule: RuleType.string().max(100).min(1) })
  avatar: string;

  @Attribute({ type: DataTypes.STRING(100), comment: '邮箱', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '邮箱', rule: RuleType.string().email().max(100) })
  email: string;

  @Attribute({ type: DataTypes.STRING(11), comment: '手机号', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '手机号', rule: RuleType.string().mobile().description('手机号').required() })
  mobile: string;

  @Attribute({
    type: DataTypes.TINYINT.UNSIGNED,
    comment: '登录失败次数',
    allowNull: false,
    defaultValue: 0,
  })
  @ApiPropertyRule({ description: '登录失败次数' })
  loginFailure: number;

  @Attribute({
    type: DataTypes.DATE,
    comment: '登录时间',
  })
  @ApiPropertyRule({ description: '最后登录时间', rule: RuleType.date() })
  lastLoginAt: Date | null;

  @Attribute({
    type: DataTypes.STRING(50),
    comment: '登录ip',
    defaultValue: '',
    allowNull: false,
  })
  @ApiPropertyRule({ description: '最后登录ip', rule: RuleType.string() })
  lastLoginIp: string;

  @Attribute({
    comment: '状态:1=启用;0=禁用',
    defaultValue: 1,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '状态:1=启用;0=禁用', rule: RuleType.number().equal(1, 0) })
  status: number;

  @Attribute({
    comment: '超级管理员:1=是;0=不是',
    defaultValue: 2,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '超级管理员:1=是;0=不是', rule: RuleType.number().equal(1, 0) })
  isSuper: number;

  @DeletedAt
  @Attribute({ comment: '删除时间' })
  declare deletedAt: Date | null;

  @BelongsToMany(() => Role, {
    through: 'admin_role', //中间表名称 或者 对应的Model
    inverse: {
      as: 'admins',
    },
  })
  @ApiPropertyRule({ description: '具有的角色' })
  declare roles?: NonAttribute<Role[]>;

  _roleMenus?: NonAttribute<Menu[]>;
  @ApiPropertyRule({ description: '具有权限的菜单' })
  get roleMenus(): NonAttribute<Menu[]> {
    return (
      this._roleMenus ??
      this.roles!.reduce((a, b) => {
        return a.concat(b.menus);
      }, [])
    );
  }

  set roleMenus(roleMenus: Menu[]) {
    this._roleMenus = roleMenus;
  }
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface Admin extends BelongsManyModel<'roles', 'role', 'roles', Role> {}
