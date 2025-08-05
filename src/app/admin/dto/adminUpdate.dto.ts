import { OmitDtoType } from '@/helper/dto.js';
import { Admin } from '../../../entities/admin.entity.js';
import { InferAttributes } from '@sequelize/core';

export class AdminUpdateDto extends OmitDtoType(
  Admin as new () => InferAttributes<Admin>, //只保留声明属性
  ['createdAt', 'updatedAt', 'salt', 'lastLoginAt', 'loginFailure', 'lastLoginIp'],
) {}
