import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  UpdateDateColumn,
} from 'typeorm';
import { Length, ValidationArguments } from 'class-validator';
import { ColumnApi } from '@/decorators/column-api';

@Entity()
export class Admin extends BaseEntity {
  @ColumnApi({ primary: true, generated: true, unsigned: true, comment: 'ID' })
  id: number;

  @Length(1, 20, {
    message: (args: ValidationArguments) => {
      return args.property + ' 长度必须在1-20之间';
    },
  })
  @ColumnApi({ length: 20, comment: '用户名' })
  username: string;

  @Length(1, 20)
  @ColumnApi({ comment: '昵称' })
  nickname: number;

  @Length(6, 20)
  @ColumnApi({ length: 32, comment: '密码' })
  password: string;

  @ColumnApi({ length: 30, comment: '密码盐' })
  salt: string;

  @Length(0, 100)
  @ColumnApi({ length: 100, comment: '头像' })
  avatar?: string;

  @ColumnApi({ length: 100, comment: '邮箱' })
  email: string;

  @ColumnApi({ length: 11, comment: '手机号' })
  mobile: string;

  @ColumnApi({
    type: 'tinyint',
    unsigned: true,
    comment: '登录失败次数',
    default: 0,
  })
  loginFailure: number;

  @ColumnApi({
    type: 'timestamp',
    comment: '登录时间',
  })
  loginAt: Date | null;

  @ColumnApi({ length: 50, comment: '登录ip' })
  loginIp: string;

  @ColumnApi({
    comment: '状态:1=启用;2=禁用',
    default: '1',
  })
  status: number;

  @ColumnApi(CreateDateColumn({ type: 'timestamp', comment: '创建时间' }), {
    description: '创建时间',
  })
  createdAt: Date;

  @ColumnApi(UpdateDateColumn({ type: 'timestamp', comment: '更新时间' }), {
    description: '创建时间',
  })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', comment: '软删除时间' })
  deletedAt: Date;
}
