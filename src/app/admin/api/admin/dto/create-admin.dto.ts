import { OmitType } from '@meadmin/nest-swagger';
import { Admin } from '../entities/admin.entity';

export class CreateAdminDto extends OmitType(Admin, [
  'id',
  'salt',
  'loginFailure',
  'loginAt',
  'loginIp',
  'createdAt',
  'updatedAt',
] as const) {}
