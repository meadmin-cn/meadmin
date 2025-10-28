import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { InferAttributesLoose } from '@/../types/entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemAdminUpdateDto extends PartialType(OmitDtoType(SystemAdmin as new () => InferAttributesLoose<SystemAdmin>,
['loginFailure','lastLoginAt','lastLoginIp'])) {}
