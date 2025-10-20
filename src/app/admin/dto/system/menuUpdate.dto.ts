import { InferAttributesLoose } from '@/../types/entity.js';
import { SystemMenu } from '../../../../entities/systemMenu.entity.js';
import { OmitDtoType } from '@/helper/dto.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemMenuUpdateDto extends  OmitDtoType(SystemMenu as new () => InferAttributesLoose<SystemMenu>,[] as const) {}