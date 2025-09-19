import { Role } from '../../../entities/role.entity.js';
import { InferAttributes } from '@sequelize/core';

export class RoleUpdateDto extends (Role as new () => InferAttributes<Role>) {}
