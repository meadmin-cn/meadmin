import { IntersectionType, PartialType } from '@/helper/dto.js';
import { Role } from '../../../entities/role.entity.js';
import { InferAttributes } from '@sequelize/core';
import { PageDto } from '@/dto/page.dto.js';

export class RoleQueryDto extends IntersectionType(
  PageDto,
  PartialType(Role as new () => InferAttributes<Role>)
) {}
