import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { InferAttributes } from '@sequelize/core';

export class SystemAdminUpdateDto extends (SystemAdmin as new () => InferAttributes<SystemAdmin>) {}
