import { Attribute, BelongsTo, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { BaseModel } from './abstract/base.entity.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { ApiPropertyRule } from '@/decorators/index.js';
import { DataTypes, NonAttribute } from '@sequelize/core';
import { SystemAdmin } from './systemAdmin.entity.js';

//rule规则使用添加接口的校验规则
@Table({ tableName: 'file', comment: '附件表' })
export class File extends BaseModel<File> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: string;

  @Attribute({ type: DataTypes.STRING(300), comment: '文件名', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '文件名', rule: RuleType.string().max(300).min(1).required().empty('') })
  name: string;

  @Attribute({ type: DataTypes.STRING(200), comment: '路径', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '路径', rule: RuleType.string() })
  path: string;

  @Attribute({ type: DataTypes.STRING(50), comment: 'mime类型', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: 'mime类型', rule: RuleType.string() })
  mimeType: string;

  @Attribute({ type: DataTypes.INTEGER(), comment: '文件大小(b)' })
  @ApiPropertyRule({ description: '文件大小', rule: RuleType.number() })
  size: number;

  @Attribute({ type: DataTypes.STRING(50), comment: '存储引擎', allowNull: false, defaultValue: 'storage' })
  @ApiPropertyRule({ description: '存储引擎', rule: RuleType.string() })
  storage: string;

  @Attribute({ type: DataTypes.STRING(32), comment: '文件MD5值', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '文件MD5值', rule: RuleType.string() })
  md5: string;

  @Attribute(DataTypes.VIRTUAL(DataTypes.STRING, ['storage', 'id', 'name', 'path'])) //增加DataTypes.VIRTUAL可以确保在属性列表中model.get获得到对应属性，并且包含在查询的属性列表中时，此属性用于自动加载依赖项。
  @ApiPropertyRule({
    description: '文件url',
    type: 'string',
  })
  get url(): string {
    return ('/api/admin/file/get/'+this.id+'/'+this.name);
  }

  @ApiPropertyRule({
    description: '创建者Id',
    type: 'string',
  })
  @Attribute({
    comment: '创建者Id(管理员)',
    type: DataTypes.STRING(20),
  })
  createdAdminId: string;

  @ApiPropertyRule({
    description: '创建者',
    type: () => SystemAdmin,
  })
  @BelongsTo(() => SystemAdmin, 'createdAdminId')
  declare createdAdmin?: NonAttribute<SystemAdmin>;

  @Attribute({
    comment: '更新者Id(管理员)',
    type: DataTypes.STRING(20),
  })
  updatedAdminId: string;

  //json转义需要加上url属性，否则创建成功后的返回实体没有对应参数返回
  toJSON() {
    return Object.assign(
      { url: this.url },
      this.get({
        plain: true,
      }),
    );
  }
}
