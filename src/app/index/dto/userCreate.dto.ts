import { User } from '../../../entities/user.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class UserCreateDto extends OmitDtoType(
  User as new () => InferAttributesLoose<User>, //只保留声明属性
  ['id', 'createdAt', 'updatedAt', 'deletedAt',  'createdUserId', 'updatedUserId','lastLoginAt','lastLoginIp','status','loginFailure'], //排除不需要字段
) {
  
}
