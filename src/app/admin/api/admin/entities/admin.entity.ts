import {
  IsIn,
  IsOptional,
  IsPositive,
  Length,
  ValidateIf,
  ValidationArguments,
} from 'class-validator';
import { ColumnApi } from '@/decorators/column-api';
import {
  CreatedAt,
  DeletedAt,
  Table,
  UpdatedAt,
} from '@sequelize/core/decorators-legacy';
import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from '@sequelize/core';
import { BaseEntity } from '@/extend/sequelize/BaseEntity';
@Table({ comment: 'admin表' })
export class Admin extends BaseEntity<
  InferAttributes<Admin>,
  InferCreationAttributes<Admin>
> {
  @ColumnApi({
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID',
  })
  declare id: CreationOptional<number>;

  @Length(1, 20, {
    message: (args: ValidationArguments) => {
      return args.property + ' 长度必须在1-20之间';
    },
  })
  @ColumnApi({ type: DataTypes.STRING(20), comment: '用户名' })
  username: string;

  @Length(1, 20)
  @ColumnApi({ type: DataTypes.STRING(20), comment: '昵称' })
  nickname: string;

  @Length(6, 20)
  @ColumnApi({ type: DataTypes.CHAR(32).BINARY, comment: '密码' })
  password: Buffer;

  @ColumnApi({ type: DataTypes.CHAR(32).BINARY, comment: '密码盐' })
  salt: Buffer;

  @Length(0, 100)
  @ColumnApi({ type: DataTypes.STRING(100), comment: '头像' })
  avatar: string;

  @ValidateIf((o) => o.email)
  @Length(0, 100)
  @ColumnApi({ type: DataTypes.STRING(100), comment: '邮箱' })
  email: string;

  @ValidateIf((o) => o.mobile)
  @Length(11, 100)
  @ColumnApi({ type: DataTypes.STRING(11), comment: '手机号' })
  mobile: string;

  @IsOptional()
  @IsPositive()
  @ColumnApi({
    type: DataTypes.TINYINT.UNSIGNED,
    comment: '登录失败次数',
    defaultValue: 0,
  })
  loginFailure: number;

  @ColumnApi({
    type: DataTypes.TIME,
    comment: '登录时间',
    defaultValue: null,
  })
  loginDate: Date | null;

  @ColumnApi({
    type: DataTypes.STRING(50),
    comment: '登录ip',
    defaultValue: '',
  })
  loginIp: CreationOptional<string>;

  @IsIn([1, 2])
  @ColumnApi({
    comment: '状态:1=启用;2=禁用',
    defaultValue: 1,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  status: number;

  @ColumnApi(CreatedAt, { description: '创建时间' })
  declare creationDate: CreationOptional<Date>;

  @ColumnApi(UpdatedAt, { description: '最后更新时间' })
  declare lastUpdateDate: CreationOptional<Date>;

  @ColumnApi(DeletedAt, { description: '删除时间' })
  declare deletionDate: Date | null;
}
