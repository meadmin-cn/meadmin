import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  UpdateDateColumn,
} from 'typeorm';
import { Length, ValidationArguments } from 'class-validator';
import { ApiHideProperty, ApiProperty } from '@meadmin/nest-swagger';
import { ColumnApi } from '@/decorators/columnApi';

@Entity()
export class Admin extends BaseEntity {
  @ApiHideProperty()
  @Column({ primary: true, generated: true, unsigned: true, comment: 'ID' })
  id: number;

  @ApiProperty({ description: '用户名' })
  @Length(1, 20, {
    message: (args: ValidationArguments) => {
      return args.property + ' 长度必须在1-20之间';
    },
  })
  @Column({ length: 20, comment: '用户名' })
  username: string;

  @ApiProperty({ description: '昵称' })
  @Length(1, 20)
  @Column({ comment: '昵称' })
  nickname: number;

  @ApiProperty({ description: '密码' })
  @Length(6, 20)
  @Column({ length: 32, comment: '密码' })
  password: string;

  @ApiProperty({ description: '密码盐' })
  @Column({ length: 30, comment: '密码盐' })
  salt: string;

  @ApiProperty({ description: '头像', default: '' })
  @Length(0, 100)
  @Column({ length: 100, comment: '头像' })
  avatar?: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ length: 100, comment: '邮箱' })
  email: string;

  @ApiProperty({ description: '手机号' })
  @Column({ length: 11, comment: '手机号' })
  mobile: string;

  @ApiHideProperty()
  @Column({
    type: 'tinyint',
    unsigned: true,
    comment: '登录失败次数',
    default: 0,
  })
  loginFailure: number;

  @ApiHideProperty()
  @Column({
    type: 'timestamp',
    comment: '登录时间',
  })
  loginTime: Date | null;

  @ApiHideProperty()
  @Column({ length: 50, comment: '登录ip' })
  loginIp: string;

  // @ApiProperty({ description: '状态:1=启用,2=禁用' })
  @ColumnApi({
    comment: '状态:1=启用;2=禁用',
    default: '1',
  })
  status: number;

  @ApiHideProperty()
  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @ApiHideProperty()
  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;
}
