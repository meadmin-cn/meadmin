import { ApiPropertyRule } from '@/decorators/swagger.js';
import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemOrganization } from '../../../../entities/systemOrganization.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemOrganizationUpdateDto extends PartialType(
  OmitDtoType(
    SystemOrganization as new () => InferAttributesLoose<SystemOrganization>, //只保留声明属性
    ['id', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin'], //排除自动创建的字段
  ),
) {
  @ApiPropertyRule({ description: '关联管理员id', rule: RuleType.array().items(RuleType.string()).required() })
  adminIds?: string[];
}
