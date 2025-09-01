import { Menu } from '../../../entities/menu.entity.js';
import { InferAttributes } from '@sequelize/core';

export class MenuUpdateDto extends (Menu as new () => InferAttributes<Menu>) {}
