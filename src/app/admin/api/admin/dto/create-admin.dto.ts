import { ApiProperty, OmitType } from '@meadmin/nest-swagger';
import { Admin } from '../entities/admin.entity';
import { entityAutoProperty, entityFunctionProperty } from '@/dict/entity';

export class CreateAdminDto extends OmitType(Admin, [
  'id',
  ...entityAutoProperty,
  ...entityFunctionProperty,
  'loginAt',
  'loginFailure',
  'loginIp',
  'salt',
] as const) {
  @ApiProperty({ required: false })
  email = '';
  @ApiProperty({ required: false })
  mobile = '';
}
