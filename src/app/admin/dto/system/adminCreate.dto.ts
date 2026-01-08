import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemAdminCreateDto extends OmitDtoType(
  SystemAdmin as new () => InferAttributesLoose<SystemAdmin>, //只保留声明属性
  ['id','loginFailure','lastLoginAt','lastLoginIp', 'createdAt','updatedAt','createdAdminId','updatedAdminId','deletedAt'], //排除自动创建的字段
) {
  @ApiPropertyRule({ description: '具有的角色id', rule: RuleType.array().items(RuleType.string()).required() })
  roleIds:string[]
}
