import { ApiPropertyRule } from '@/decorators/index.js';
import { OmitDtoType, PartialType } from '@/helper/dto.js';
import { InferAttributesLoose } from '@/types/entity.js';
import { RuleType } from '@midwayjs/validate';
import { User } from '../../../entities/user.entity.js';

//dto参数校验继承 entity必须使用 PickDtoType|OmitDtoType|PartialType|RequiredType|IntersectionType 之一 否则不会生效
export class UserUpdateDto extends PartialType(
  OmitDtoType(
    User as new () => InferAttributesLoose<User>, //只保留声明属性
    ['id', 'createdAt', 'updatedAt', 'createdUserId', 'updatedUserId', 'createdAdminId', 'updatedAdminId', 'createdUser', 'updatedUser', 'createdAdmin', 'updatedAdmin', 'updatedUserId', 'lastLoginAt', 'lastLoginIp', 'status', 'loginFailure'], //排除不需要字段
  ),
) {
  @ApiPropertyRule({ description: '原始密码', rule: RuleType.string() })
  orgPassword: string;
}
