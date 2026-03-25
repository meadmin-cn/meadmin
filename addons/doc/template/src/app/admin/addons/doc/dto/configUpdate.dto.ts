import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { AonDocConfig } from '../../../../../entities/aonDocConfig.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class AonDocConfigUpdateDto extends PartialType(
  OmitDtoType(
    AonDocConfig as new () => InferAttributesLoose<AonDocConfig>, //只保留声明属性
    ['id', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin'], //排除自动创建的字段
  ),
) {}
