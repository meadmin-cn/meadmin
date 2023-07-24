import { ApiProperty, OmitType } from '@meadmin/nest-swagger';
import { Admin } from '../entities/admin.entity';
import { entityAutoProperty, entityFunctionProperty } from '@/dict/entity';
import { CreationAttributes } from '@sequelize/core';
class A {}
export class CreateAdminDto extends OmitType(
  Admin as unknown as CreationAttributes<Admin> & typeof A,
  ['id', 'loginAt', 'loginFailure', 'loginIp', 'salt'] as const,
) {
  @ApiProperty({ required: false })
  email = '';
  @ApiProperty({ required: false })
  mobile = '';
}
const c = new CreateAdminDto();
