import { PageDto } from '@/dto/page.dto.js';
import { IntersectionType, OmitDtoType, PartialType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemConfigGroup } from '../../../../entities/systemConfigGroup.entity.js';

export class SystemConfigGroupQueryDto extends IntersectionType(PageDto, PartialType(OmitDtoType(SystemConfigGroup as new () => InferAttributesLoose<SystemConfigGroup>, ['id', 'configs', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin']))) {}
