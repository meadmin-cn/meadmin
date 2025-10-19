import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/../types/entity.js';

export class SystemAdminCreateDto extends OmitDtoType(
  SystemAdmin as new () => InferAttributesLoose<SystemAdmin>, //只保留声明属性
  ['id','loginFailure','lastLoginAt','lastLoginIp'], //排除自动创建的主键
) {}
