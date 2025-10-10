import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributes } from '@sequelize/core';

export class SystemAdminCreateDto extends OmitDtoType(
  SystemAdmin as new () => InferAttributes<SystemAdmin>, //只保留声明属性
  ['id'], //排除自动创建的主键
) {}
