import { IntersectionType, PartialType } from '@/helper/dto.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { InferAttributesLoose } from '@/../types/entity.js';
import { PageDto } from '@/dto/page.dto.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@/ruleType/index.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemAdminQueryDto extends IntersectionType(PageDto, PartialType(SystemAdmin as new () => InferAttributesLoose<SystemAdmin>)) {
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

  @ApiPropertyRule({ description: '手机号', rule: RuleType.string() })
  mobile?: string;
}
