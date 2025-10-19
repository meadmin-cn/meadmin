import { IntersectionType, PartialType } from '@/helper/dto.js';
import { SystemRole } from '../../../../entities/systemRole.entity.js';
import { InferAttributesLoose } from '@/../types/entity.js';
import { PageDto } from '@/dto/page.dto.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

export class SystemRoleQueryDto extends IntersectionType(PageDto, PartialType(SystemRole as new () => InferAttributesLoose<SystemRole>)) {
  @ApiPropertyRule({ description: '创建时间(起)', rule: RuleType.date() })
  startCreatedAt?: Date;

  @ApiPropertyRule({ description: '创建时间(止)', rule: RuleType.date() })
  endCreatedAt?: Date;
  @ApiPropertyRule({ description: '最后更新时间(起)', rule: RuleType.date() })
  startUpdatedAt?: Date;

  @ApiPropertyRule({ description: '最后更新时间(止)', rule: RuleType.date() })
  endUpdatedAt?: Date;
}
