import { ApiPropertyRule } from '@/decorators/index.js';
import { InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, CreatedAt, Table, UpdatedAt } from '@sequelize/core/decorators-legacy';

//基础model
@Table.Abstract
export class BaseModel<M extends Model<any, any>> extends Model<InferAttributes<M>, InferCreationAttributes<M>> {
  @CreatedAt
  @Attribute({ comment: '创建时间' })
  @ApiPropertyRule({ description: '创建时间' })
  declare createdAt: Date;

  @UpdatedAt
  @Attribute({ comment: '最后更新时间' })
  @ApiPropertyRule({ description: '最后更新时间' })
  declare updatedAt: Date;
}
