import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { InferAttributesLoose } from '@/../types/entity.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemAdminUpdateDto extends PartialType(OmitDtoType(SystemAdmin as new () => InferAttributesLoose<SystemAdmin>,
['loginFailure','lastLoginAt','lastLoginIp'])) {
  @ApiPropertyRule({ description: '具有的角色id', rule: RuleType.array().items(RuleType.string()).required() })
  roleIds:string[];
}
