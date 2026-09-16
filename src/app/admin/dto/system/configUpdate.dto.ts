import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemConfig } from '../../../../entities/systemConfig.entity.js';

export class SystemConfigUpdateDto extends PartialType(OmitDtoType(SystemConfig as new () => InferAttributesLoose<SystemConfig>, ['id', 'isBuiltin', 'group', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin'])) {}
