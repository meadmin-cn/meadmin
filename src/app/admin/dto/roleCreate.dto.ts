import { Role } from '../../../entities/role.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributes } from '@sequelize/core';

export class RoleCreateDto extends OmitDtoType(
  Role as new () => InferAttributes<Role>, //只保留声明属性
  ['id'] //排除自动创建的主键
) {}
