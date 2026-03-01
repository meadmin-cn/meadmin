import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { DataTypes, NonAttribute } from '@sequelize/core';
import { Attribute, BelongsTo, Default, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
// import { BaseModel } from './abstract/base.entity.js';
import { BelongsToModel } from '@/types/entity.js';
import { AdminTreeModel } from './abstract/adminTree.entity.js';
import { File } from './file.entity.js';
//rule规则使用添加接口的校验规则,建议字符串的默认值统一使用空串，否则RuleType.string需要显示声明allow(null)允许传入null
@Table({ tableName: 'aon_doc', comment: '文档表' })
//注意SystemAdmin扩展字段时不能import其余Model以规避循环引用，如需增加外键关联,需用inverse将关联设置另一侧
export class AonDoc extends AdminTreeModel<AonDoc> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: string;

  @Attribute({
    comment: '名称',
    type: DataTypes.STRING(100),
    defaultValue: '',
    allowNull: false,
  })
  @ApiPropertyRule({
    description: '名称',
    rule: RuleType.string().max(100).required(),
  })
  title: string;

  @Attribute({ type: DataTypes.STRING(20), comment: '图标附件id' })
  iconFileId: string;

  @ApiPropertyRule({
    description: '图标(200*200)',
    type: () => File,
    rule: RuleType.object({ id: RuleType.string().required() }),
  })
  @BelongsTo(() => File, {
    foreignKey: 'iconFileId', //外键名称
    foreignKeyConstraints: false, //数据库不创建外键，外键应用层解决
  })
  icon?: NonAttribute<File>;

  @BelongsTo(() => AonDoc, {
    foreignKey: 'parentId',
    foreignKeyConstraints: false,
  }) //不创建数据库外键约束
  @ApiPropertyRule({ description: '父级', type: () => AonDoc })
  declare parent?: NonAttribute<AonDoc>;

  @Attribute({
    comment: '类型:1=目录;2=菜单',
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: false,
  })
  @ApiPropertyRule({
    description: '类型:1=目录;2=菜单',
    rule: RuleType.number().valid(1, 2).required(),
  })
  type: number;

  @Attribute({
    comment: '状态:1=启用;0=禁用',
    defaultValue: 1,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({
    description: '状态:1=启用;0=禁用',
    rule: RuleType.number().valid(1, 0),
  })
  status: number;

  @Attribute({
    comment: '排序(降序)',
    type: DataTypes.SMALLINT,
    defaultValue: 0,
    allowNull: false,
  })
  @ApiPropertyRule({
    description: '排序(降序)',
    rule: RuleType.number().integer().max(9999),
  })
  orderNum: number;

  @Attribute({
    comment: '内容类型:0=markdown;1=外链',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: null,
    allowNull: true,
  })
  @ApiPropertyRule({
    description: '内容类型:0=markdown;1=外链',
    rule: RuleType.number().valid(0, 1),
  })
  contentType: number;

  @Attribute({
    comment: '内容',
    type: DataTypes.TEXT,
    defaultValue: '',
    allowNull: true,
  })
  @ApiPropertyRule({
    description: '内容',
    rule: RuleType.string().when('contentType', {
      is: 0,
      then: RuleType.required(),
    }),
  })
  mdContent: string;

  @Attribute({
    comment: '外链地址',
    type: DataTypes.TEXT,
    defaultValue: '',
    allowNull: true,
  })
  @ApiPropertyRule({
    description: '外链地址',
    rule: RuleType.string().when('contentType', {
      is: 1,
      then: RuleType.required(),
    }),
  })
  link: string;
}
export declare interface AonDoc extends BelongsToModel<'icon', File> {}
