import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemConfigGroup } from '../../../../entities/systemConfigGroup.entity.js';

export class SystemConfigGroupCreateDto extends OmitDtoType(SystemConfigGroup as new () => InferAttributesLoose<SystemConfigGroup>, ['id', 'groupType', 'isBuiltin', 'configs', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin']) {}
