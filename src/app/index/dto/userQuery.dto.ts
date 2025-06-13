import { IntersectionType, PartialType } from '@/helper/dto.js';
import { User } from '../../../entities/user.entity.js';
import { InferAttributes } from '@sequelize/core';
import { PageDto } from '@/dto/page.dto.js';

export class UserQueryDto extends IntersectionType(
  PageDto,
  PartialType(User as new () => InferAttributes<User>)
) {}
