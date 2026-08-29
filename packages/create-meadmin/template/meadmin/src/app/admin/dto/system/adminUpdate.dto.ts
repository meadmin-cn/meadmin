import { ApiPropertyRule } from '@/decorators/index.js';
import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemAdminUpdateDto extends PartialType(OmitDtoType(SystemAdmin as new () => InferAttributesLoose<SystemAdmin>, ['id', 'loginFailure', 'lastLoginAt', 'lastLoginIp', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'deletedAt'])) {
  //具有的角色
  @ApiPropertyRule({ description: '具有的角色id', rule: RuleType.array().items(RuleType.string()).required() })
  roleIds: string[];

  //具有的组织
  @ApiPropertyRule({ description: '具有的组织id', rule: RuleType.array().items(RuleType.string()).required() })
  orgIds: string[];
}
