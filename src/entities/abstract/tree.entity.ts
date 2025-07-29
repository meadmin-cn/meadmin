import { CreateOptions, DataTypes, InstanceDestroyOptions, InstanceUpdateOptions, Op } from '@sequelize/core';
import { AfterDestroy, Attribute, BeforeCreate, BeforeUpdate, Table } from '@sequelize/core/decorators-legacy';
import { BaseModel } from './base.entity.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@midwayjs/validate';
import { uuid } from '@/helper/snowflake.js';

//无限级树形
@Table.Abstract
export class TreeModel<M extends TreeModel<any>> extends BaseModel<M> {
  @Attribute({
    comment: '父级id',
    type: DataTypes.STRING(100),
  })
  @ApiPropertyRule({ description: '父级id', rule: RuleType.string().max(100) })
  parentId: string;

  @Attribute({
    comment: '左树边界',
    type: DataTypes.STRING(100),
  })
  left: number;

  @Attribute({
    comment: '右树边界',
    type: DataTypes.STRING(100),
  })
  right: number;

  @Attribute({
    comment: '锁版本号',
    type: DataTypes.STRING(100),
  })
  declare lockVersion: string;

  @BeforeCreate()
  static async setLeftRightByCreate(info: TreeModel<any>, options: CreateOptions<any>) {
    let left = 1;
    if (info.parentId) {
      const parentinfo = await this.findByPk(info.parentId);
      left = parentinfo.right;
    } else {
      const parentinfo = await this.findOne({ order: [['right', 'DESC']] });
      if (parentinfo) {
        left = parentinfo.right + 1;
      }
    }
    info.left = left;
    info.right = left + 1;
    await this.sequelize.query(`update ${this.table.tableName} set  right = right + 2 where right >= :right`, {
      replacements: { right: info.right },
      transaction: options.transaction,
    });
    await this.sequelize.query(`update ${this.table.tableName} set  left = left + 2 where left >= :right`, {
      replacements: { right: info.right },
      transaction: options.transaction,
    });
  }

  @AfterDestroy()
  static async setLeftRightByDestory(info: TreeModel<any>, options: InstanceDestroyOptions) {
    //删除子孙级
    await this.sequelize.query(`delete ${this.table.tableName} where left > :left and right < :right`, {
      replacements: { left: info.left, right: info.right },
      transaction: options.transaction,
    });
    const step = info.right - info.left + 1;
    //右侧的左移
    await this.sequelize.query(`update ${this.table.tableName} set right - :step where left > :right`, {
      replacements: { step: step, right: info.right },
      transaction: options.transaction,
    });
    await this.sequelize.query(`update ${this.table.tableName} set left - :step where left > :right`, {
      replacements: { step: step, right: info.right },
      transaction: options.transaction,
    });
  }

  @BeforeUpdate()
  static async setLeftRightByUpdate(info: TreeModel<any>, options: InstanceUpdateOptions<any>) {
    const version = uuid();
    const oldLeft = info.left;
    //锁定数据及当前子孙
    await this.sequelize.query(`update ${this.table.tableName} set lock_version = :version where left >= :left and right <= :right`, {
      replacements: { version: version, left: info.left, right: info.right },
      transaction: options.transaction,
    });
    const step = info.right - info.left + 1;
    //右侧的左移
    await this.sequelize.query(`update ${this.table.tableName} set right - :step where left > :right and lock_version != :version`, {
      replacements: { step: step, right: info.right, version: version },
      transaction: options.transaction,
    });
    await this.sequelize.query(`update ${this.table.tableName} set left - :step where left > :right and lock_version != :version`, {
      replacements: { step: step, right: info.right, version: version },
      transaction: options.transaction,
    });
    //添加
    let left = 1;
    if (info.parentId) {
      const parentinfo = await this.findByPk(info.parentId);
      left = parentinfo.right;
    } else {
      const parentinfo = await this.findOne({ where: { lockVersion: { [Op.ne]: version } }, order: [['right', 'DESC']] });
      if (parentinfo) {
        left = parentinfo.right + 1;
      }
    }
    info.left = left;
    info.right = left + step - 1;
    await this.sequelize.query(`update ${this.table.tableName} set  right = right + :step where right >= :right and lock_version != :version`, {
      replacements: { right: info.right, step: step, version: version },
      transaction: options.transaction,
    });
    await this.sequelize.query(`update ${this.table.tableName} set  left = left + :step where left >= :right and lock_version != :version`, {
      replacements: { right: info.right, step: step, version: version },
      transaction: options.transaction,
    });
    if (oldLeft > info.left) {
      await this.sequelize.query(`update ${this.table.tableName} set  left = left - :step,right = right - :step where lock_version = :version`, {
        replacements: { step: oldLeft - info.left, right: info.right, version: version },
        transaction: options.transaction,
      });
    } else {
      await this.sequelize.query(`update ${this.table.tableName} set  left = left + :step,right = right + :step where lock_version = :version`, {
        replacements: { step: info.left - oldLeft, right: info.right, version: version },
        transaction: options.transaction,
      });
    }
  }
}
