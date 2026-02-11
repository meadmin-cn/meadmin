import { ApiPropertyRule } from '@/decorators/index.js';
import { getContext } from '@meadmin/core';
import { BulkCreateOptions, InferAttributes, InferCreationAttributes, InstanceUpdateOptions, Model, ModelStatic, UpdateOptions } from '@sequelize/core';
import { AfterBulkUpdate, Attribute, BeforeBulkCreate, BeforeCreate, BeforeUpdate, CreatedAt, Table, UpdatedAt } from '@sequelize/core/decorators-legacy';

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
  static async setCreatedId(info: BaseModel<any>, options: InstanceUpdateOptions<BaseModel<any>>) {
    const ctx = getContext();
    if (ctx?.adminInfo && info.modelDefinition.attributes.has('createdAdminId')) {
      //设置创建管理员Id
      (info as any).createdAdminId = ctx.adminInfo.id;
      if (ctx?.adminInfo && info.modelDefinition.attributes.has('updatedAdminId')) {
        //设置更新管理员Id
        (info as any).updatedAdminId = ctx.adminInfo.id;
      }
    }
    if (ctx?.userInfo && info.modelDefinition.attributes.has('createdUserId')) {
      //设置创建用户Id
      (info as any).createdUserId = ctx.userInfo.id;
      if (ctx?.userInfo && info.modelDefinition.attributes.has('updatedUserId')) {
        //设置更新用户Id
        (info as any).updatedUserId = ctx.userInfo.id;
      }
    }
  }

  @BeforeBulkCreate()
  static async setCreatedIdBulk(instances: BaseModel<any>[], options: BulkCreateOptions<BaseModel<any>> & { model: ModelStatic<BaseModel<any>> }) {
    const ctx = getContext();
    if (ctx?.adminInfo && options.model.modelDefinition.attributes.has('createdAdminId')) {
      //设置创建管理员Id
      instances.forEach((instance) => {
        (instance as any).createdAdminId = ctx.adminInfo.id;
      });
      if (options.model.modelDefinition.attributes.has('updatedAdminId')) {
        //设置更新管理员Id
        instances.forEach((instance) => {
          (instance as any).updatedAdminId = ctx.adminInfo.id;
        });
      }
    }
    if (ctx?.userInfo && options.model.modelDefinition.attributes.has('createdUserId')) {
      //设置创建用户Id
      instances.forEach((instance) => {
        (instance as any).createdUserId = ctx.userInfo.id;
      });
      if (options.model.modelDefinition.attributes.has('updatedUserId')) {
        //设置更新用户Id
        instances.forEach((instance) => {
          (instance as any).updatedUserId = ctx.userInfo.id;
        });
      }
    }
  }

  @BeforeUpdate()
  static async setUpdatedId(info: BaseModel<any>, options: InstanceUpdateOptions<BaseModel<any>>) {
    const ctx = getContext();
    if (ctx?.adminInfo && info.modelDefinition.attributes.has('updatedAdminId')) {
      //设置更新管理员Id
      (info as any).updatedAdminId = ctx.adminInfo.id;
    }
    if (ctx?.userInfo && info.modelDefinition.attributes.has('updatedUserId')) {
      //设置更新用户Id
      (info as any).updatedUserId = ctx.userInfo.id;
    }
  }

  @AfterBulkUpdate()
  static async setUpdatedIdBulk(options: UpdateOptions<BaseModel<any>> & { model: ModelStatic<BaseModel<any>> }) {
    const ctx = getContext();
    if (ctx?.adminInfo && options.model.modelDefinition.attributes.has('updatedAdminId')) {
      //设置更新管理员Id
      await options.model.update(
        { updatedAdminId: ctx.adminInfo.id },
        {
          where: options.where,
          transaction: options.transaction,
          hooks: false,
        },
      );
    }
    if (ctx?.userInfo && options.model.modelDefinition.attributes.has('updatedUserId')) {
      //设置更新用户Id
      await options.model.update(
        { updatedUserId: ctx.userInfo.id },
        {
          where: options.where,
          transaction: options.transaction,
          hooks: false,
        },
      );
    }
  }
}
