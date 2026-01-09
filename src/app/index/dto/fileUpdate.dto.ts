import { UserFile } from '../../../entities/userFile.entity.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { OmitDtoType, PartialType } from '@/helper/dto.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class FileUpdateDto extends PartialType(OmitDtoType(
  UserFile as new () => InferAttributesLoose<UserFile>, //只保留声明属性
  ['id', 'createdAt', 'updatedAt', 'url', 'createdUserId', 'updatedUserId', 'createdAdminId', 'updatedAdminId','createdUser','updatedUser','createdAdmin', 'updatedAdmin',], //排除自动创建的属性
)) {}
