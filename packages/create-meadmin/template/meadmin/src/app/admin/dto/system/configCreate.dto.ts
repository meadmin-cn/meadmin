import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemConfig } from '../../../../entities/systemConfig.entity.js';

export class SystemConfigCreateDto extends OmitDtoType(SystemConfig as new () => InferAttributesLoose<SystemConfig>, ['id', 'isBuiltin', 'group', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin']) {}
