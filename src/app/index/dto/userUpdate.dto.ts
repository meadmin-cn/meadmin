import { User } from '../../../entities/user.entity.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { PartialType, OmitDtoType } from '@/helper/dto.js';
import { RuleType } from '@midwayjs/validate';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class UserUpdateDto extends PartialType(
  OmitDtoType(
    User as new () => InferAttributesLoose<User>, //只保留声明属性
    ['id', 'createdAt', 'updatedAt', 'deletedAt', 'createdUserId', 'updatedUserId','lastLoginAt','lastLoginIp','status','loginFailure'], //排除自动创建的字段
  ),
) {
  @ApiPropertyRule({ description: '原始密码', rule: RuleType.string() })
  orgPassword: string;
}
