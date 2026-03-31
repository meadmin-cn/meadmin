import { PickDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { AonDoc } from '../../../../../entities/aonDoc.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class AonDocContentResultDto extends PickDtoType(
  AonDoc as new () => InferAttributesLoose<AonDoc>, //只保留声明属性
  ['type', 'contentType', 'mdContent', 'title', 'version', 'label'],
) {}
