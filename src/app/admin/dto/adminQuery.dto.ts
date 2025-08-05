import { IntersectionType, PartialType } from '@/helper/dto.js';
import { Admin } from '../../../entities/admin.entity.js';
import { InferAttributes } from '@sequelize/core';
import { PageDto } from '@/dto/page.dto.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

export class AdminQueryDto extends IntersectionType(PageDto, PartialType(Admin as new () => InferAttributes<Admin>)) {
  @ApiPropertyRule({ description: '创建时间(起)', rule: RuleType.date() })
  startCreatedAt: Date;
  @ApiPropertyRule({ description: '创建时间(止)', rule: RuleType.date() })
  endCreatedAt: Date;
  @ApiPropertyRule({ description: '更新时间(起)', rule: RuleType.date() })
  startUpdatedAt?: Date;
  @ApiPropertyRule({ description: '更新时间(止)', rule: RuleType.date() })
  endUpdatedAt?: Date;
}
