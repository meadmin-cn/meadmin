import { SystemMenu } from '../../../../entities/systemMenu.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/../types/entity.js';

export class SystemMenuCreateDto extends OmitDtoType(
  SystemMenu as new () => InferAttributesLoose<SystemMenu>, //只保留声明属性
  ['id'], //排除自动创建的主键
) {}
