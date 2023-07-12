import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PartialType,
} from '@meadmin/nest-swagger';
import { CreateAdminDto } from './create-admin.dto';
import { PageReq } from '@/request/api-page.req';
import { IsDate } from 'class-validator';

export class QueryAdminDto extends IntersectionType(
  PageReq,
  PartialType(OmitType(CreateAdminDto, ['password'] as const)),
) {
  @ApiProperty({ description: '登录时间(起)' })
  @IsDate()
  loginAtStart?: Date;
  @ApiProperty({ description: '登录时间(止)' })
  @IsDate()
  loginAtEnd?: Date;
}
