import { User } from '../../../entities/user.entity.js';
import { OmitDtoType } from '@/helper/swagger.helper.js';

export class UserAddDto extends OmitDtoType(User, ['id']) {}
