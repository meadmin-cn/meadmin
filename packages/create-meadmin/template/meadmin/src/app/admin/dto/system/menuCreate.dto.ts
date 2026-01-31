import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemMenu } from '../../../../entities/systemMenu.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemMenuCreateDto extends OmitDtoType(
  SystemMenu as new () => InferAttributesLoose<SystemMenu>, //只保留声明属性
  ['id', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId'],
) {
  //排除自动创建的字段
}
