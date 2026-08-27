import { ApiPropertyRule } from '@/decorators/index.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemOrganization } from '../../../../entities/systemOrganization.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemOrganizationTreeAllResultDto extends (SystemOrganization as new () => InferAttributesLoose<SystemOrganization>) {
  @ApiPropertyRule({ description: '子级', type: 'array', items: { type: () => SystemOrganizationTreeAllResultDto } })
  childern: SystemOrganizationTreeAllResultDto[];
}
