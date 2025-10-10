import { IntersectionType, PartialType } from '@/helper/dto.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { InferAttributes } from '@sequelize/core';
import { PageDto } from '@/dto/page.dto.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

export class SystemAdminQueryDto extends IntersectionType(PageDto, PartialType(SystemAdmin as new () => InferAttributes<SystemAdmin>)) {
  @ApiPropertyRule({ description: '最后登录时间(起)', rule: RuleType.date() })
  startLastLoginAt?: Date;
  @ApiPropertyRule({ description: '最后登录时间(止)', rule: RuleType.date() })
  endLastLoginAt?: Date;

  @ApiPropertyRule({ description: '创建时间(起)', rule: RuleType.date() })
  startCreatedAt?: Date;
  @ApiPropertyRule({ description: '创建时间(止)', rule: RuleType.date() })
  endCreatedAt?: Date;
  @ApiPropertyRule({ description: '最后更新时间(起)', rule: RuleType.date() })
  startUpdatedAt?: Date;
  @ApiPropertyRule({ description: '最后更新时间(止)', rule: RuleType.date() })
  endUpdatedAt?: Date;
}
