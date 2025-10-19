import { OmitDtoType } from '@/helper/dto.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { InferAttributesLoose } from '@/../types/entity.js';

export class SystemAdminUpdateDto extends OmitDtoType(SystemAdmin as new () => InferAttributesLoose<SystemAdmin>,
['loginFailure','lastLoginAt','lastLoginIp']) {}
