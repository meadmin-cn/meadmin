import { InferAttributesLoose } from '@/../types/entity.js';
import { SystemRole } from '../../../../entities/systemRole.entity.js';
import { OmitDtoType } from '@/helper/dto.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemRoleUpdateDto extends OmitDtoType(SystemRole as new () => InferAttributesLoose<SystemRole>,[] as const) {}