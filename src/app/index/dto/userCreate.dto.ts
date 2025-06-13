import { User } from '../../../entities/user.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributes } from '@sequelize/core';

export class UserCreateDto extends OmitDtoType(
  User as new () => InferAttributes<User>, //只保留声明属性
  ['id'] //排除自动创建的主键
) {}
