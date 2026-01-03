import {
  CreateOptions,
  DataTypes,
  InstanceDestroyOptions,
  InstanceUpdateOptions,
  Op,
  Model,
  ModelStatic,
  InferAttributes,
  InferCreationAttributes,
  FindOptions,
  Attributes,
  sql,
} from '@sequelize/core';
import { AfterDestroy, AfterUpdate, Attribute, BeforeCreate, Table } from '@sequelize/core/decorators-legacy';
import { ApiPropertyRule } from '@/decorators/index.js';
import { RuleType } from '@midwayjs/validate';
import { uuid } from '@/helper/snowflake.js';
import { listToTree } from '@/helper/utils.js';
import { AdminBaseModel } from './adminBase.entity.js';

//无限级树形
@Table.Abstract
export class AdminTreeModel<M extends AdminTreeModel<any> = any> extends AdminBaseModel<M> {
  @Attribute({
    comment: '父级id',
    type: DataTypes.STRING(100),
  })
  @ApiPropertyRule({ description: '父级id', rule: RuleType.string().max(100).allow(null) })
  parentId: string;

  @Attribute({
    comment: '左树边界',
    type: DataTypes.INTEGER.UNSIGNED,
  })
  left: number;

  @Attribute({
    comment: '右树边界',
    type: DataTypes.INTEGER.UNSIGNED,
  })
  right: number;

  @Attribute({
    comment: '锁版本号',
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
  })
  lockVersion: string;

  @BeforeCreate()
  static async setLeftRightByCreate<M extends TreeModel>(this: ModelStatic<M>, info: M, options: CreateOptions<any>) {
    const model = info.modelDefinition.model;
    type MInfo = Model<InferAttributes<TreeModel>, InferCreationAttributes<TreeModel>>;
    let left = 1;
    if (info.parentId) {
      const parentinfo = (await model.findByPk<MInfo>(info.parentId, { transaction: options.transaction })) as M;
      left = parentinfo.right;
    } else {
      const parentinfo = (await model.findOne<MInfo>({ order: [['right', 'DESC']], transaction: options.transaction })) as M;
      if (parentinfo) {
        left = parentinfo.right + 1;
      }
    }
    info.left = left;
    info.right = left + 1;
    await model.increment<MInfo>(
      {
        right: 2,
      },
      {
        where: { right: { [Op.gte]: info.left } },
        transaction: options.transaction,
      },
    );
    await model.increment<MInfo>(
      {
        left: 2,
      },
      {
        where: { left: { [Op.gte]: info.left } },
        transaction: options.transaction,
      },
    );
  }

  @AfterDestroy()
  static async setLeftRightByDestory<M extends TreeModel>(this: ModelStatic<M>, info: M, options: InstanceDestroyOptions) {
    //删除子孙级
    const model = info.modelDefinition.model;
    type MInfo = Model<InferAttributes<TreeModel>, InferCreationAttributes<TreeModel>>;
    await model.destroy<MInfo>({
      where: {
        left: { [Op.gt]: info.left },
        right: { [Op.lt]: info.right },
      },
      transaction: options.transaction,
    });
    const step = info.right - info.left + 1;
    //右侧的左移
    await model.decrement<MInfo>(
      {
        right: step,
      },
      {
        where: {
          right: {
            [Op.gt]: info.right,
          },
        },
        transaction: options.transaction,
      },
    );
    await model.decrement<MInfo>(
      { left: step },
      {
        where: {
          left: {
            [Op.gt]: info.right,
          },
        },
        transaction: options.transaction,
      },
    );
  }

  @AfterUpdate()
  static async setLeftRightByUpdate<M extends TreeModel>(this: ModelStatic<M>, info: M, options: InstanceUpdateOptions<any>) {
    const version = uuid();
    const oldLeft = info.left;
    const model = info.modelDefinition.model;
    type MInfo = Model<InferAttributes<TreeModel>, InferCreationAttributes<TreeModel>>;
    //锁定当前及当前子孙数据
    await model.update<MInfo>(
      {
        lockVersion: version,
      },
      {
        where: {
          left: {
            [Op.gte]: info.left,
          },
          right: {
            [Op.lte]: info.right,
          },
        },
        transaction: options.transaction,
      },
    );
    const step = info.right - info.left + 1;
    //右侧的左移
    await model.decrement<MInfo>(
      {
        right: step,
      },
      {
        where: {
          right: {
            [Op.gt]: info.right,
          },
        },
        transaction: options.transaction,
      },
    );
    await model.decrement<MInfo>(
      { left: step },
      {
        where: {
          left: {
            [Op.gt]: info.right,
          },
        },
        transaction: options.transaction,
      },
    );
    //添加
    let left = 1;
    if (info.parentId) {
      const parentinfo = (await model.findByPk<MInfo>(info.parentId, { transaction: options.transaction })) as M;
      left = parentinfo.right;
    } else {
      const parentinfo = (await model.findOne<MInfo>({ where: { lockVersion: { [Op.ne]: version } }, order: [['right', 'DESC']], transaction: options.transaction })) as M;
      if (parentinfo) {
        left = parentinfo.right + 1;
      }
    }
    info.left = left;
    info.right = left + step - 1;
    await model.increment<MInfo>(
      {
        right: step,
      },
      {
        where: {
          lockVersion: {
            [Op.ne]: version,
          },
          right: {
            [Op.gte]: info.left,
          },
        },
        transaction: options.transaction,
      },
    );
    await model.increment<MInfo>(
      {
        left: step,
      },
      {
        where: {
          lockVersion: {
            [Op.ne]: version,
          },
          left: {
            [Op.gte]: info.left,
          },
        },
        transaction: options.transaction,
      },
    );
    if (oldLeft > info.left) {
      await model.update<MInfo>(
        { left: sql`${sql.attribute('left')} - ${oldLeft - info.left}`, right: sql`${sql.attribute('right')} - ${oldLeft - info.left}`, lockVersion: '' },
        { where: { lockVersion: version }, transaction: options.transaction },
      );
    } else {
      await model.update<MInfo>(
        { left: sql`${sql.attribute('left')} + ${info.left - oldLeft}`, right: sql`${sql.attribute('right')} + ${info.left - oldLeft}`, lockVersion: '' },
        { where: { lockVersion: version }, transaction: options.transaction },
      );
    }
  }

  //获取树形数据,返回值为普通object不是model
  static async getTree<M extends Model>(this: ModelStatic<M>, options?: FindOptions<Attributes<M>> | (Omit<FindOptions<Attributes<M>>, 'raw'> & { raw: true })) {
    const list = await this.findAll(options);
    return listToTree<M>(list.map((item) => item.dataValues));
  }

  //获取所有后代,并以树形返回,返回值为普通object不是model
  async getDescendants() {
    const list = await this.modelDefinition.model.findAll({
      where: {
        left: {
          [Op.gt]: this.left,
        },
        right: {
          [Op.lt]: this.right,
        },
      },
    });
    return listToTree(list.map((item) => item.dataValues));
  }

  //TODO::根据parentId重置树形参数，尚未实现
  static async perfectTree() {}
}
