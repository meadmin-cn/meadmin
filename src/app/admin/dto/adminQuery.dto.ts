import { IntersectionType, PartialType } from '@/helper/dto.js';
import { Admin } from '../../../entities/admin.entity.js';
import { InferAttributes } from '@sequelize/core';
import { PageDto } from '@/dto/page.dto.js';

export class AdminQueryDto extends IntersectionType(
  PageDto,
  PartialType(Admin as new () => InferAttributes<Admin>)
) {}
