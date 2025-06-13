import { __Name__ } from '__entityPath__';
import { OmitDtoType } from '@/helper/dto.js';
import { InferAttributes } from '@sequelize/core';

export class __CreateDto__ extends OmitDtoType(
  __Name__ as new () => InferAttributes<__Name__>, //只保留声明属性
  ['__pk__'] //排除自动创建的主键
) {}
