import { ApiPropertyRule } from '@/decorators/index.js';
import { getContext } from '@meadmin/core';
import { Context } from '@midwayjs/koa';
import { BulkCreateOptions, CreationOptional, InferAttributes, InferCreationAttributes, InstanceUpdateOptions, ModelStatic, UpdateOptions } from '@sequelize/core';
import { Model } from '@sequelize/core';
import { AfterBulkUpdate, Attribute, BeforeBulkCreate, BeforeCreate, BeforeUpdate, CreatedAt, Table, UpdatedAt } from '@sequelize/core/decorators-legacy';

//基础model
@Table.Abstract
export class BaseModel<M extends Model<any, any>> extends Model<InferAttributes<M>, InferCreationAttributes<M>> {
  @CreatedAt
  @Attribute({ comment: '创建时间' })
  @ApiPropertyRule({ description: '创建时间',type:'date' })
  declare createdAt: CreationOptional<Date>; //CreationOptional标记在模型创建过程中可以省略的属性。用于具有默认值或标记为自动生成的属性。swagger无法识别CreationOptional 需要手动设置

  @UpdatedAt
  @Attribute({ comment: '最后更新时间' })
  @ApiPropertyRule({ description: '最后更新时间',type:'date' })
  declare updatedAt: CreationOptional<Date>; //CreationOptional标记在模型创建过程中可以省略的属性。用于具有默认值或标记为自动生成的属性。swagger无法识别CreationOptional 需要手动设置

  @BeforeCreate()
  static async setCreatedId(info: BaseModel<any>) {
    let ctx: Context| undefined;
    try {
      ctx = getContext();
    } catch { /* empty */ }
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
  static async setCreatedIdBulk(
    instances: BaseModel<any>[],
    options: BulkCreateOptions<BaseModel<any>> & {
      model: ModelStatic<BaseModel<any>>;
    },
  ) {
    let ctx: Context| undefined;
    try {
      ctx = getContext();
    } catch { /* empty */ }
    if (ctx?.adminInfo && options.model.modelDefinition.attributes.has('createdAdminId')) {
      //设置创建管理员Id
      instances.forEach((instance) => {
        (instance as any).createdAdminId = ctx.adminInfo!.id;
      });
      if (options.model.modelDefinition.attributes.has('updatedAdminId')) {
        //设置更新管理员Id
        instances.forEach((instance) => {
          (instance as any).updatedAdminId = ctx.adminInfo!.id;
        });
      }
    }
    if (ctx?.userInfo && options.model.modelDefinition.attributes.has('createdUserId')) {
      //设置创建用户Id
      instances.forEach((instance) => {
        (instance as any).createdUserId = ctx.userInfo!.id;
      });
      if (options.model.modelDefinition.attributes.has('updatedUserId')) {
        //设置更新用户Id
        instances.forEach((instance) => {
          (instance as any).updatedUserId = ctx.userInfo!.id;
        });
      }
    }
  }

  @BeforeUpdate()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async setUpdatedId(info: BaseModel<any>, _options: InstanceUpdateOptions<BaseModel<any>>) {
    let ctx: Context| undefined;
    try {
      ctx = getContext();
    } catch { /* empty */ }
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
  static async setUpdatedIdBulk(
    options: UpdateOptions<BaseModel<any>> & {
      model: ModelStatic<BaseModel<any>>;
    },
  ) {
    let ctx: Context | undefined;
    try {
      ctx = getContext();
    } catch { /* empty */ }
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
