import { ApiPropertyRule } from '@/decorators/index.js';
import { PageDto } from '@/dto/page.dto.js';
import { IntersectionType, OmitDtoType, PartialType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { Job } from '../../../entities/job.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class JobQueryDto extends IntersectionType(
  PageDto,
  PartialType(
    OmitDtoType(
      Job as new () => InferAttributesLoose<Job>,
      ['createdAdmin', 'updatedAdmin', 'createdAt', 'updatedAt'], //排除关联字段、虚拟属性、自动生成的属性(如果想更加简洁可以省略OmitDtoType，用InferAttributes替换InferAttributesLoose，不过需注意对应字段不创建rule，否则会行为不一致)
    ),
  ),
) {
  @ApiPropertyRule({ description: '创建时间(起)', rule: RuleType.date() })
  startCreatedAt?: Date;

  @ApiPropertyRule({ description: '创建时间(止)', rule: RuleType.date() })
  endCreatedAt?: Date;
  @ApiPropertyRule({ description: '最后更新时间(起)', rule: RuleType.date() })
  startUpdatedAt?: Date;

  @ApiPropertyRule({ description: '最后更新时间(止)', rule: RuleType.date() })
  endUpdatedAt?: Date;
}
