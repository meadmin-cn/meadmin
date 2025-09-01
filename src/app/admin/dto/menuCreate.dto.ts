import { Menu } from '../../../entities/menu.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributes } from '@sequelize/core';

export class MenuCreateDto extends OmitDtoType(
  Menu as new () => InferAttributes<Menu>, //只保留声明属性
  ['id'] //排除自动创建的主键
) {}
