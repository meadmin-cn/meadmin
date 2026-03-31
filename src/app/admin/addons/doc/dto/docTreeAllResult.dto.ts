import { ApiPropertyRule } from '@/decorators/index.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { AonDoc } from '../../../../../entities/aonDoc.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class AonDocTreeAllResultDto extends (AonDoc as new () => InferAttributesLoose<AonDoc>) {
  @ApiPropertyRule({
    description: '子级',
    type: 'array',
    items: { type: () => AonDocTreeAllResultDto },
  })
  childern: AonDocTreeAllResultDto[];
}
