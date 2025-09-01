import { IntersectionType, PartialType } from '@/helper/dto.js';
import { Menu } from '../../../entities/menu.entity.js';
import { InferAttributes } from '@sequelize/core';
import { PageDto } from '@/dto/page.dto.js';

export class MenuQueryDto extends IntersectionType(
  PageDto,
  PartialType(Menu as new () => InferAttributes<Menu>)
) {}
