import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { DataTypes, NonAttribute, Op } from '@sequelize/core';
import { Attribute, PrimaryKey, Default, Table, BelongsToMany, BelongsTo, Index, DeletedAt } from '@sequelize/core/decorators-legacy';
import { ApiPropertyRule } from '@/decorators/index.js';
import { SystemRole } from './systemRole.entity.js';
import { BelongsManyModel } from '../../types/entity.js';
import { SystemMenu } from './systemMenu.entity.js';
import { File } from './file.entity.js';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

//rule规则使用添加接口的校验规则,建议字符串的默认值统一使用空串，否则RuleType.string需要显示声明allow(null)允许传入null
@Table({ tableName: 'system_admin', comment: '管理员表' })
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class SystemAdmin extends AdminBaseModel<SystemAdmin> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: string;

  @Index({unique:true, where:{deletedAt: { [Op.not]: null }}}) //局部唯一索引设置只有不删除的数据加索引
  @Attribute({ type: DataTypes.STRING(50), comment: '用户名', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '用户名', rule: RuleType.string().max(50).min(1).required().empty('') })
  username: string;

  @Attribute({ type: DataTypes.STRING(20), comment: '昵称', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '昵称', rule: RuleType.string().max(20).min(1).required() })
  nickname: string;

  @Attribute({ type: DataTypes.STRING(64), comment: '密码', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '密码', rule: RuleType.string() })
  password: string;

  @Attribute({ type: DataTypes.STRING(32), comment: '密码盐', allowNull: false, defaultValue: '' })
  salt: string;

  @Attribute({ type: DataTypes.STRING(20), comment: '头像附件id',})
  avatarFileId: string;

  @ApiPropertyRule({ description: '头像', type: () => File, rule: RuleType.object({id:RuleType.string().required()}) })
  @BelongsTo(() => File, /* foreign key */ 'avatarFileId')
  avatar?: NonAttribute<File>

  @Index({unique:true, where:{deletedAt: { [Op.not]: null }}}) //局部唯一索引设置只有不删除的数据加索引
  @Attribute({ type: DataTypes.STRING(100), comment: '邮箱'})
  @ApiPropertyRule({ description: '邮箱', rule: RuleType.string().email().max(100).required() })
  email: string;

  @Index({unique:true, where:{deletedAt: { [Op.not]: null }}}) //局部唯一索引设置只有不删除的数据加索引
  @Attribute({ type: DataTypes.STRING(11), comment: '手机号' })
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
  @ApiPropertyRule({ description: '状态:1=启用;0=禁用', rule: RuleType.number().equal(1, 0).required() })
  status: number;

  @DeletedAt//设置为软删除
  @Attribute({ comment: '删除时间' })
  declare deletedAt: Date | null;

  @BelongsToMany(() => SystemRole, {
    through: 'admin_role', //中间表名称 或者 对应的Model
    inverse: {
      as: 'admins',
    },
  })
  @ApiPropertyRule({
    description: '具有的角色',
    type: 'array',
    items: {
      type: () => SystemRole,
    },
  })
  declare roles?: NonAttribute<SystemRole[]>;

  _roleMenus?: NonAttribute<SystemMenu[]>;
  @ApiPropertyRule({
    description: '具有权限的菜单',
    type: 'array',
    items: {
      type: () => SystemMenu,
    },
  })
  get roleMenus(): NonAttribute<SystemMenu[]> {
    return (
      this._roleMenus ??
      this.roles!.reduce((a, b) => {
        return a.concat(b.menus);
      }, [])
    );
  }

  set roleMenus(roleMenus: SystemMenu[]) {
    this._roleMenus = roleMenus;
  }

  //json转义时丢弃password
  toJSON() {
    return Object.assign(
      {},
      this.get({
        plain: true,
      }),
      { password: '', self: '' },
    );
  }
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface SystemAdmin extends BelongsManyModel<'roles', 'role', 'roles', SystemRole> {}
