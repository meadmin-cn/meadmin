import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from '@meadmin/nest-swagger';
import { PageReq } from '@/request/api-page.req';
import { IsDateString, ValidateIf } from 'class-validator';
import { Admin } from '../entities/admin.entity';

export class QueryAdminDto extends IntersectionType(
  PageReq,
  PartialType(
    OmitType(Admin, [
      'password',
      'loginAt',
      'createdAt',
      'updatedAt',
      'deletedAt',
    ] as const),
  ),
) {
  @ValidateIf((o) => o.loginAt?.length)
  @IsDateString(undefined, { each: true })
  @ApiProperty({ description: '登录时间', type: ['datetime'] })
  loginAt?: [string, string];

  @ValidateIf((o) => o.createdAt?.length)
  @IsDateString(undefined, { each: true })
  @ApiProperty({ description: '创建时间', type: ['datetime'] })
  createdAt?: [string, string];

  @ValidateIf((o) => o.updatedAt?.length)
  @IsDateString(undefined, { each: true })
  @ApiProperty({ description: '更新时间', type: ['datetime'] })
  updatedAt?: [string, string];
}
