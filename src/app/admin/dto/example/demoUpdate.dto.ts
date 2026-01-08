import { InferAttributesLoose } from '@/types/entity.js';
import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { ExampleDemo } from '../../../../entities/exampleDemo.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class ExampleDemoUpdateDto extends PartialType(
  OmitDtoType(
    ExampleDemo as new () => InferAttributesLoose<ExampleDemo>, //只保留声明属性
    ['id', 'createdAt', 'updatedAt', 'deletedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin'], //排除自动创建的字段
  ),
) {}
