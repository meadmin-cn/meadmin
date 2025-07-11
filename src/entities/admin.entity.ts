import { uuid } from '@/helper/snowflake.js';
import { ApiProperty } from '@midwayjs/swagger';
import { Rule } from '@midwayjs/validate';
import { RuleType } from '@/ruleType/index.js';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from '@sequelize/core';
import {
  Attribute,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Table,
} from '@sequelize/core/decorators-legacy';
import { ApiPropertyRule } from '@/decorators/index.js';

//rule规则使用添加时传入规则
@Table({ tableName: 'admin', comment: '管理员表' })
export class Admin extends Model<
  InferAttributes<Admin>,
  InferCreationAttributes<Admin>
> {
  @Attribute(DataTypes.STRING)
  @PrimaryKey
  @Default(uuid)
  @Rule(RuleType.string())
  @ApiProperty({ description: 'ID' })
  id: string;

  @Attribute({ type: DataTypes.STRING(20), comment: '用户名' })
  @ApiPropertyRule({ description: '用户名', rule:RuleType.string().max(10).min(1).required().empty('') })
  username: string;

  @Attribute({ type: DataTypes.STRING(20), comment: '昵称' })
  @ApiPropertyRule({ description: '昵称', rule:RuleType.string().max(10).min(1).required() })
  nickname: string;

  @Attribute({ type: DataTypes.CHAR(32), comment: '密码' })
  @ApiPropertyRule({ description: '密码', rule:RuleType.string().max(10).min(1).required() })
  password: string;

  @Attribute({ type: DataTypes.CHAR(32), comment: '密码盐' })
  @ApiPropertyRule({ description: '密码盐' })
  salt: string;

  @Attribute({ type: DataTypes.STRING(100), comment: '头像' })
  @ApiPropertyRule({ description: '头像', rule:RuleType.string().max(100).min(1) })
  avatar: string;

  @Attribute({ type: DataTypes.STRING(100), comment: '邮箱' })
  @ApiPropertyRule({ description: '邮箱', rule:RuleType.string().email().max(100) })
  email: string;

  @Attribute({ type: DataTypes.STRING(11), comment: '手机号' })
  @ApiPropertyRule({ description: '手机号', rule:RuleType.string().mobile().description('手机号').required() })
  mobile: string;

  @Attribute({
    type: DataTypes.TINYINT.UNSIGNED,
    comment: '登录失败次数',
    defaultValue: 0,
  })
  @ApiPropertyRule({ description: '登录失败次数' })
  loginFailure: number;

  @Attribute({
    type: DataTypes.TIME,
    comment: '登录时间',
  })
  @ApiPropertyRule({ description: '登录时间', rule:RuleType.date()})
  loginDate: Date | null;

  @Attribute({
    type: DataTypes.STRING(50),
    comment: '登录ip',
    defaultValue: '',
  })
  @ApiPropertyRule({ description: '登录ip', rule:RuleType.string().required() })
  loginIp?: string;

  @Attribute({
    comment: '状态:1=启用;2=禁用',
    defaultValue: 1,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '状态:1=启用;2=禁用',rule:RuleType.number().equal(1, 2).default(1) })
  status: number;

  @CreatedAt
  @Attribute({ comment: '创建时间' })
  @ApiPropertyRule({ description: '创建时间' })
  declare createdAt: Date;

  @UpdatedAt
  @Attribute({ comment: '最后更新时间' })
  @ApiPropertyRule({ description: '最后更新时间' })
  declare updatedAt: Date;

  @DeletedAt
  @Attribute({ comment: '删除时间' })
  declare deletedAt: Date | null;
}
