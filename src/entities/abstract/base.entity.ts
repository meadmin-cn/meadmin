import { ApiPropertyRule } from '@/decorators/index.js';
import { InferAttributes, InferCreationAttributes, InstanceUpdateOptions, Model } from '@sequelize/core';
import { Attribute, BeforeCreate, BeforeUpdate, CreatedAt, Table, UpdatedAt } from '@sequelize/core/decorators-legacy';

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
  
  @BeforeCreate()
  static async setCreatedId(info: BaseModel<any>, options: InstanceUpdateOptions<any>) {
    if(info.modelDefinition.attributes.has('createdAdminId')){
      //TODO::设置创建管理员
    }
  }


  @BeforeUpdate()
  static async setUpdatedId(info: BaseModel<any>, options: InstanceUpdateOptions<any>) {

  }
}
