import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { BelongsManyModel, BelongsToModel } from '@/types/entity.js';
import { getSchemaPath } from '@midwayjs/swagger';
import { CreationOptional, NonAttribute } from '@sequelize/core';
import { DataTypes, Op } from '@sequelize/core';
import { Attribute, BelongsTo, Default, DeletedAt, Index, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { File } from './file.entity.js';
import { SystemMenu } from './systemMenu.entity.js';
import { SystemRole } from './systemRole.entity.js';
// import { BaseModel } from './abstract/base.entity.js';
import { BaseModel } from './abstract/base.entity.js';
import { SystemOrgaization } from './systemOrganization.entity.js';

//rule规则使用添加接口的校验规则,建议字符串的默认值统一使用空串，否则RuleType.string需要显示声明allow(null)允许传入null
@Table({ tableName: 'system_admin', comment: '管理员表' })
//避免循环引用，继承BaseModel 而非 AdminBaseModel，其余后台表继承AdminBaseModel即可。注意SystemAdmin扩展字段时不能import其余Model以规避循环引用，如需增加外键关联,需用inverse将关联设置另一侧
export class SystemAdmin extends BaseModel<SystemAdmin> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>;//CreationOptional 是 Sequelize 提供的一个类型，用于表示在创建实例时可以省略的属性，因为它们会由数据库自动生成或有默认值。

  @Index({ unique: true, where: { deleted_at: { [Op.isNot]: null } } }) //局部唯一索引设置只有不删除的数据加索引
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

  @Attribute({ type: DataTypes.STRING(20), comment: '头像附件id' })
  avatarFileId: string;

  @ApiPropertyRule({ description: '头像', $ref: getSchemaPath('File'), rule: RuleType.object({ id: RuleType.string().required() }) })
  // @BelongsTo(() => File, /* foreign key */ 'avatarFileId')避免循环引用，将外键配置放在file表中
  avatar?: NonAttribute<File>;

  @Index({ unique: true, where: { deleted_at: { [Op.isNot]: null } } }) //局部唯一索引设置只有不删除的数据加索引
  @Attribute({ type: DataTypes.STRING(100), comment: '邮箱' })
  @ApiPropertyRule({ description: '邮箱', rule: RuleType.string().email().max(100) })
  email: string;

  @Index({ unique: true, where: { deleted_at: { [Op.isNot]: null } } }) //局部唯一索引设置只有不删除的数据加索引
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
  loginFailure: CreationOptional<number>;//CreationOptional 是 Sequelize 提供的一个类型，用于表示在创建实例时可以省略的属性，因为它们会由数据库自动生成或有默认值。

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
  lastLoginIp: CreationOptional<string>;//CreationOptional 是 Sequelize 提供的一个类型，用于表示在创建实例时可以省略的属性，因为它们会由数据库自动生成或有默认值。

  @Attribute({
    comment: '状态:1=启用;0=禁用',
    defaultValue: 1,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '状态:1=启用;0=禁用', rule: RuleType.number().equal(1, 0).required() })
  status: number;

  @DeletedAt //设置为软删除
  @Attribute({ comment: '删除时间' })
  declare deletedAt: Date | null;

  /** Declared by {@link SystemRole.admins} */
  @ApiPropertyRule({
    description: '具有的角色',
    type: 'array',
    items: {
      $ref: () => getSchemaPath('SystemRole'),
    },
  })
  declare roles?: NonAttribute<SystemRole[]>;

  _roleMenus?: NonAttribute<SystemMenu[]>;
  @ApiPropertyRule({
    description: '具有权限的菜单',
    type: 'array',
    items: {
      $ref: () => getSchemaPath('SystemMenu'),
    },
  })
  get roleMenus(): NonAttribute<SystemMenu[]> {
    return (
      this._roleMenus ??
      this.roles!.reduce((a, b) => {
        return (a).concat(b.menus as NonAttribute<SystemMenu[]>);
      }, [] as NonAttribute<SystemMenu[]>)
    );
  }

  set roleMenus(roleMenus: SystemMenu[]) {
    this._roleMenus = roleMenus;
  }

   /** Declared by {@link SystemOrgaization.admins} */
  @ApiPropertyRule({
    description: '具有的组织',
    type: 'array',
    items: {
      $ref: () => getSchemaPath('SystemRole'),
    },
  })
  declare orgaizations?: NonAttribute<SystemOrgaization[]>;

  @Attribute({
    comment: '创建者(管理员)Id',
    type: DataTypes.STRING(20),
  })
  createdAdminId: CreationOptional<string>;//CreationOptional 是 Sequelize 提供的一个类型，用于表示在创建实例时可以省略的属性，因为它们会由数据库自动生成或有默认值。

  @ApiPropertyRule({
    description: '创建者(管理员)',
    type: () => SystemAdmin,
  })
  @BelongsTo(() => SystemAdmin, { foreignKey: 'createdAdminId', foreignKeyConstraints: false })
  declare createdAdmin?: NonAttribute<SystemAdmin | null>;

  @Attribute({
    comment: '最后更新者(管理员)Id',
    type: DataTypes.STRING(20),
  })
  updatedAdminId: CreationOptional<string>;//CreationOptional 是 Sequelize 提供的一个类型，用于表示在创建实例时可以省略的属性，因为它们会由数据库自动生成或有默认值。

  @ApiPropertyRule({
    description: '最后更新者(管理员)',
    type: () => SystemAdmin,
  })
  @BelongsTo(() => SystemAdmin, { foreignKey: 'updatedAdminId', foreignKeyConstraints: false })
  declare updatedAdmin?: NonAttribute<SystemAdmin | null>;

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
export declare interface SystemAdmin extends BelongsManyModel<'roles', 'role', 'roles', SystemRole> {}
export declare interface SystemAdmin extends BelongsManyModel<'orgaizations', 'orgaization', 'orgaizations', SystemOrgaization> {}
export declare interface SystemAdmin extends BelongsToModel<'avatar', File> {}
