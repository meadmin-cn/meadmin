import { Attribute, BelongsTo, Default, DeletedAt, Index, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { DataTypes, NonAttribute, Op } from '@sequelize/core';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';
import { uuid } from '@/helper/snowflake.js';
import { UserFile } from './userFile.entity.js';
import { ApiExtraModel, getSchemaPath } from '@midwayjs/swagger';
import { BaseModel } from './abstract/base.entity.js';

(async()=>{
  ApiExtraModel((await import('./userFile.entity.js')).UserFile);
})();

//rule规则使用添加接口的校验规则,建议字符串的默认值统一使用空串，否则RuleType.string需要显示声明allow(null)允许传入null
@Table({ tableName: 'user', comment: '用户表' })
//避免循环引用，继承BaseModel 而非 IndexBaseModel，其余前台表继承IndexBaseModel即可。注意User扩展字段时不能import其余Model以规避循环引用，如需增加外键关联,需用inverse将关联设置在另一侧
export class User extends BaseModel<User> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: string;

  @Index({unique:true, where:{'deleted_at': { [Op.isNot]: null }}}) //局部唯一索引设置只有不删除的数据加索引
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

  @ApiPropertyRule({ description: '头像（优先级高于avatarFileId）', $ref: getSchemaPath('UserFile'), rule: RuleType.object({id:RuleType.string().required()}) })
  // @BelongsTo(() => UserFile, /* foreign key */ 'avatarFileId')  避免循环引用，将外键配置放在userFile表中
  avatar?: NonAttribute<UserFile>;

  @Index({unique:true, where:{'deleted_at': { [Op.isNot]: null }}}) //局部唯一索引设置只有不删除的数据加索引
  @Attribute({ type: DataTypes.STRING(100), comment: '邮箱', defaultValue: null })
  @ApiPropertyRule({ description: '邮箱', rule: RuleType.string().email().max(100) })
  email: string | null;

  @Index({unique:true, where:{'deleted_at': { [Op.isNot]: null }}}) //局部唯一索引设置只有不删除的数据加索引
  @Attribute({ type: DataTypes.STRING(11), comment: '手机号', defaultValue: null })
  @ApiPropertyRule({ description: '手机号', rule: RuleType.string().mobile() })
  mobile: string | null;

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

 @ApiPropertyRule({
    description: '创建者Id',
    type: 'string',
  })
  @Attribute({
    comment: '创建者Id(用户)',
    type: DataTypes.STRING(20),
  })
  createdUserId: string;

  @ApiPropertyRule({
    description: '创建者',
    type: () => User,
  })
  @BelongsTo(() => User, 'createdUserId')
  declare createdUser?: NonAttribute<User>;

  @Attribute({
    comment: '更新者Id(管理员)',
    type: DataTypes.STRING(20),
  })
  updatedUserId: string;

  @ApiPropertyRule({
    description: '最后更新者',
    type: () => User,
  })
  @BelongsTo(() => User, 'updatedUserId')
  declare updatedUser?: NonAttribute<User>;


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
