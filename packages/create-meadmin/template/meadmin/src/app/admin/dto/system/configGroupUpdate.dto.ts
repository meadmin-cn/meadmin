import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemConfigGroup } from '../../../../entities/systemConfigGroup.entity.js';

export class SystemConfigGroupUpdateDto extends PartialType(OmitDtoType(SystemConfigGroup as new () => InferAttributesLoose<SystemConfigGroup>, ['id', 'isBuiltin', 'groupType', 'configs', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin'])) {}
