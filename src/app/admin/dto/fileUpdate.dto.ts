import { File } from '../../../entities/file.entity.js';
import { InferAttributesLoose } from '@/../types/entity.js';
import { OmitDtoType, PartialType } from '@/helper/dto.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class FileUpdateDto extends PartialType(OmitDtoType(
  File as new () => InferAttributesLoose<File>, //只保留声明属性
  ['id', 'createdAt', 'updatedAt', 'url', 'createdAdminId', 'updatedAdminId'], //排除自动创建的属性
)) {}
