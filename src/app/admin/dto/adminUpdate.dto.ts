import { Admin } from '../../../entities/admin.entity.js';
import { InferAttributes } from '@sequelize/core';

export class AdminUpdateDto extends (Admin as new () => InferAttributes<Admin>) {}
