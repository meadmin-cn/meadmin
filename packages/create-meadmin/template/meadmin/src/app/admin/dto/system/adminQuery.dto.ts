import { ApiPropertyRule } from '@/decorators/index.js';
import { PageDto } from '@/dto/page.dto.js';
import { IntersectionType, OmitDtoType, PartialType } from '@/helper/dto.js';
import { RuleType } from '@/ruleType/index.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class SystemAdminQueryDto extends IntersectionType(
  PageDto,
  PartialType(
    OmitDtoType(
      SystemAdmin as new () => InferAttributesLoose<SystemAdmin>,
      ['_roleMenus', 'roleMenus', 'avatar', 'roles', 'organizations', 'createdAdmin', 'updatedAdmin'], //移除关联字段和虚拟属性
    ),
  ),
) {
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

  @ApiPropertyRule({ description: '模糊查询字段，查询username、nickname、mobile', rule: RuleType.string() })
  query?: string; //模糊查询字段，查询username、nickname、mobile

  @ApiPropertyRule({ description: '具有的角色id', rule: RuleType.array().items(RuleType.string()) })
  roleIds?: Array<string>; //具有的角色id

  @ApiPropertyRule({ description: '具有的组织Id', rule: RuleType.array().items(RuleType.string()) })
  orgIds?: Array<string>;
}
