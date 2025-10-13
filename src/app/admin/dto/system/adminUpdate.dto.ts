import { OmitDtoType } from '@/helper/dto.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { InferAttributes } from '@sequelize/core';

export class SystemAdminUpdateDto extends OmitDtoType(SystemAdmin as new () => InferAttributes<SystemAdmin>,
['loginFailure','lastLoginAt','lastLoginIp']) {}
