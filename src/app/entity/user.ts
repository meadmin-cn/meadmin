import { uuid } from '@/helper/snowflake.js';
import { ApiProperty } from '@midwayjs/swagger';
import { Rule } from '@midwayjs/validate';
import { RuleType } from '@/ruleType/index.js';
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from '@sequelize/core';
import {
  Attribute,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from '@sequelize/core/decorators-legacy';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  @Attribute(DataTypes.STRING)
  @PrimaryKey
  @Default(uuid)
  @Rule(RuleType.string())
  id: string;

  @Rule(RuleType.string().max(10).min(1).required())
  @Attribute({ type: DataTypes.STRING(20), comment: '用户名' })
  @ApiProperty({ description: '用户名' })
  username: string;

  @Rule(RuleType.string().max(10).min(1).required())
  @Attribute({ type: DataTypes.STRING(20), comment: '昵称' })
  @ApiProperty({ description: '昵称' })
  nickname: string;

  @Rule(RuleType.string().max(10).min(1).required())
  @Attribute({ type: DataTypes.CHAR(32).BINARY, comment: '密码' })
  @ApiProperty({ description: '密码' })
  password: Buffer;

  @Attribute({ type: DataTypes.CHAR(32).BINARY, comment: '密码盐' })
  @ApiProperty({ description: '密码盐' })
  salt: Buffer;

  @Rule(RuleType.string().max(100).min(1))
  @Attribute({ type: DataTypes.STRING(100), comment: '头像' })
  @ApiProperty({ description: '头像' })
  avatar: string;

  @Rule(RuleType.string().max(100))
  @Attribute({ type: DataTypes.STRING(100), comment: '邮箱' })
  @ApiProperty({ description: '邮箱' })
  email: string;

  @Rule(RuleType.string().mobile().description('手机号'))
  @Attribute({ type: DataTypes.STRING(11), comment: '手机号' })
  @ApiProperty({ description: '手机号' })
  mobile: string;

  @Attribute({
    type: DataTypes.TINYINT.UNSIGNED,
    comment: '登录失败次数',
    defaultValue: 0,
  })
  @ApiProperty({ description: '登录失败次数' })
  loginFailure: number;

  @Attribute({
    type: DataTypes.TIME,
    comment: '登录时间',
    defaultValue: null,
  })
  @ApiProperty({ description: '登录时间' })
  loginDate: Date | null;

  @Attribute({
    type: DataTypes.STRING(50),
    comment: '登录ip',
    defaultValue: '',
  })
  @ApiProperty({ description: '登录ip' })
  loginIp: CreationOptional<string>;

  @Rule(RuleType.number().equal(1, 2))
  @Attribute({
    comment: '状态:1=启用;2=禁用',
    defaultValue: 1,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiProperty({ description: '状态:1=启用;2=禁用' })
  status: number;

  @CreatedAt
  @Attribute({ comment: '创建时间' })
  @ApiProperty({ description: '创建时间' })
  declare creationDate: CreationOptional<Date>;

  @UpdatedAt
  @Attribute({ comment: '最后更新时间' })
  @ApiProperty({ description: '最后更新时间' })
  declare lastUpdateDate: CreationOptional<Date>;

  @DeletedAt
  @Attribute({ comment: '删除时间' })
  declare deletionDate: Date | null;
}
