import { SystemRole } from '../../../../entities/systemRole.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/../types/entity.js';

export class SystemRoleCreateDto extends OmitDtoType(
  SystemRole as new () => InferAttributesLoose<SystemRole>, //只保留声明属性
  ['id'], //排除自动创建的主键
) {}
