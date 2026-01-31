import { ApiPropertyRule } from '@/decorators/index.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemMenu } from '../../../../entities/systemMenu.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemMenuTreeAllResultDto extends (SystemMenu as new () => InferAttributesLoose<SystemMenu, { omit: 'roles' }>) {
  @ApiPropertyRule({ description: '子级', type: 'array', items: { type: () => SystemMenuTreeAllResultDto } })
  childern: SystemMenuTreeAllResultDto[];
}
