import { Attribute, BeforeBulkDestroy, BeforeBulkRestore, BeforeDestroy, BeforeRestore, DeletedAt, Table } from "@sequelize/core/decorators-legacy";
import { BaseModel } from "./base.entity.js";
import { DataTypes, DestroyOptions, InstanceDestroyOptions, InstanceRestoreOptions, ModelStatic, RestoreOptions, sql } from '@sequelize/core';

//软删除Model 可针对 deletedVersion 生成联合唯一索引
@Table.Abstract
export class DelParanoidModel<M extends DelParanoidModel<any>> extends BaseModel<M> {
    @DeletedAt
    @Attribute({ comment: '删除时间' })
    declare deletedAt: Date | null;
  
    @Attribute({ type: DataTypes.STRING(20), defaultValue: '', comment: '删除版本(未删除固定为空串,已删除为当前记录id,方便用作联合唯一索引)' })
    deletedVersion: string;
  

    @BeforeDestroy()
    static async setDeletedVersion(info: DelParanoidModel<any>, options: InstanceDestroyOptions) {
      if(options.force) return;
      await info.update(
        {deletedVersion:sql`id`,},
        {
          transaction: options.transaction,
          silent: true,
        }
      );
    }
  
    @BeforeBulkDestroy()
    static async setDeletedVersionBulk(options: DestroyOptions<DelParanoidModel<any>> & {model:ModelStatic<DelParanoidModel<any>>}){
      if(options.force) return;
      let where = options.where ;
      if(!options.where || JSON.stringify(options.where) === '{}'){
        where=sql`1 = 1`;
      }
      const pk = options.model.getAttributes()[options.model.modelDefinition.primaryKeysAttributeNames.firstValue()].columnName
      await options.model.sequelize.query(sql`UPDATE ${sql.identifier(options.model)}  SET  ${sql.attribute(options.model.getAttributes()['deletedVersion'].columnName)} = ${sql.attribute(pk)}  WHERE ${sql.where(where) }`,{
        transaction: options.transaction,
      });
    }
  
    @BeforeRestore()
    static async restoreDeletedVersion(info: DelParanoidModel<any>, options: InstanceRestoreOptions) {
      await info.update(
        {deletedVersion:'',},
        {
          transaction: options.transaction,
          silent: true,
        }
      );
    }
  
    @BeforeBulkRestore()
    static async restoreDeletedVersionBulk(options: RestoreOptions<DelParanoidModel<any>> & {model:ModelStatic<DelParanoidModel<any>>}) {
        let where = options.where ;
        if(!options.where || JSON.stringify(options.where) === '{}'){
          where=sql`1 = 1`;
        }
        await options.model.sequelize.query(sql`UPDATE ${sql.identifier(options.model)}  SET  ${sql.attribute(options.model.getAttributes()['deletedVersion'].columnName)} = ''  WHERE ${sql.where(where) }`,{
          transaction: options.transaction,
        });
    }
}