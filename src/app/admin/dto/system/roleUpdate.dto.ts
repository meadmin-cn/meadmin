import { InferAttributesLoose } from '@/../types/entity.js';
import { SystemRole } from '../../../../entities/systemRole.entity.js';
import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemRoleUpdateDto extends PartialType(OmitDtoType(SystemRole as new () => InferAttributesLoose<SystemRole>, ['menus'])) {
  @ApiPropertyRule({ description: '具有权限的菜单id', rule: RuleType.array().items(RuleType.string()) })
  menuIds:string[]
}