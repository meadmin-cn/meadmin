import { Admin } from '../../../entities/admin.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributes } from '@sequelize/core';

export class AdminCreateDto extends OmitDtoType(
  Admin as new () => InferAttributes<Admin>, //只保留声明属性
  ['id', 'createdAt', 'updatedAt', 'salt', 'lastLoginAt', 'loginFailure', 'lastLoginIp'],
) {}
