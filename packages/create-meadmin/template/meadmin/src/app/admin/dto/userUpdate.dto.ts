import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { User } from '../../../entities/user.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class UserUpdateDto extends PartialType(
  OmitDtoType(
    User as new () => InferAttributesLoose<User>, //只保留声明属性
    ['id', 'createdAt', 'updatedAt', 'deletedAt'], //排除自动创建的字段
  ),
) {}
