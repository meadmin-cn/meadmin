import { ApiProperty, OmitType } from '@meadmin/nest-swagger';
import { Admin } from '../entities/admin.entity';
import { entityAutoProperty, entityFunctionProperty } from '@/dict/entity';

export class CreateAdminDto extends OmitType(Admin, [
  ...entityFunctionProperty,
  ...entityAutoProperty,
  'loginIp',
  'salt',
  'password',
] as const) {
  @ApiProperty({ required: false })
  email = '';
  @ApiProperty({ required: false })
  mobile = '';
  password: string;
}
