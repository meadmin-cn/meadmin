import { IntersectionType, PartialType } from '@/helper/dto.js';
import { __Name__ } from '__entityPath__';
import { InferAttributes } from '@sequelize/core';
import { PageDto } from '@/dto/page.dto.js';

export class __QueryDto__ extends IntersectionType(
  PageDto,
  PartialType(__Name__ as new () => InferAttributes<__Name__>)
) {}
