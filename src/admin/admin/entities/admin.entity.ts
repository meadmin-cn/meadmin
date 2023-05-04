import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Admin extends BaseEntity {
  @Column({ primary: true, generated: true, unsigned: true, comment: 'ID' })
  id: number;

  @Column({ length: 20, comment: '用户名' })
  username: string;

  @Column({ length: 20, comment: '昵称' })
  nickname: string;

  @Column({ length: 32, comment: '密码' })
  password: string;

  @Column({ length: 30, comment: '密码盐' })
  salt: string;

  @Column({ length: 100, comment: '头像' })
  avatar: string;

  @Column({ length: 100, comment: '邮箱' })
  email: string;

  @Column({ length: 11, comment: '手机号' })
  mobile: string;

  @Column({
    type: 'tinyint',
    unsigned: true,
    comment: '登录失败次数',
    default: 0,
  })
  loginFailure: number;

  @Column({
    type: 'timestamp',
    comment: '登录时间',
  })
  loginTime: Date | null;

  @Column({ length: 50, comment: '登录ip' })
  loginIp: string;

  @Column({
    type: 'enum',
    enum: ['1', '2'],
    comment: '状态:1=启用,2=禁用',
    default: '1',
  })
  status: string;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;
}
