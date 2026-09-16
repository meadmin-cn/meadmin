import { ApiPropertyRule } from '@/decorators/index.js';
import { PageDto } from '@/dto/page.dto.js';
import { IntersectionType, OmitDtoType, PartialType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemConfig } from '../../../../entities/systemConfig.entity.js';

export class SystemConfigQueryDto extends IntersectionType(PageDto, PartialType(OmitDtoType(SystemConfig as new () => InferAttributesLoose<SystemConfig>, ['id', 'group', 'isBuiltin', 'options', 'createdAt', 'updatedAt', 'createdAdminId', 'updatedAdminId', 'createdAdmin', 'updatedAdmin']))) {
  @ApiPropertyRule({ description: '分组ID', rule: RuleType.string() })
  groupId?: string;

  @ApiPropertyRule({ description: '字典标题或字典标识', rule: RuleType.string().allow('') })
  keyword?: string;
}
