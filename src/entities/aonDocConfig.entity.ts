import { Attribute, BelongsTo, Default, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";
import { AdminBaseModel } from "./abstract/adminBase.entity.js";
import { CreationOptional, NonAttribute } from "@sequelize/core";
import { DataTypes } from "@sequelize/core";
import { uuid } from "@/helper/snowflake.js";
import { ApiPropertyRule } from "@/decorators/index.js";
import { RuleType } from "@/ruleType/index.js";
import { File } from "./file.entity.js";
import { BelongsToModel } from "@/types/entity.js";
export class AonConfigVersion{
  @ApiPropertyRule({ description: '标题',})
  title:string;
  @ApiPropertyRule({ description: '标识',})
  code:string;
  @ApiPropertyRule({ description: '状态:1=启用;0=禁用', rule: RuleType.number().equal(1, 0).required() })
  status: number;
}
export class AonDocConfiglinks{
  @ApiPropertyRule({ description: '图片(200*200)'})
  icon:File;
  @ApiPropertyRule({ description: '标识'})
  title:string;
  @ApiPropertyRule({ description: '地址'})
  url:string;
}
@Table({ tableName: 'aon_doc_config', comment: '配置表' })
export class AonDocConfig extends AdminBaseModel<AonDocConfig>{
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>;//CreationOptional 是 Sequelize 提供的一个类型，用于表示在创建实例时可以省略的属性，因为它们会由数据库自动生成或有默认值。
  
  //反向BelongsTo关联从属，File类型创建单文件
  @Attribute({ type: DataTypes.STRING(20), comment: '图标附件id' })
  iconFileId: string;
  @ApiPropertyRule({ description: '图标', type: () => File, rule: RuleType.object({ id: RuleType.string().required() }).pattern(RuleType.string(), RuleType.any()) })
  @BelongsTo(() => File, {
    foreignKey: 'iconFileId', //外键名称
    foreignKeyConstraints: false, //数据库不创建外键，外键应用层解决
  })
  icon?: NonAttribute<File>;

  @Attribute({ type:DataTypes.JSON(), comment: '版本'})
  @Default([])
  @ApiPropertyRule({ description: '版本', 
    type: 'array',
    items: {
      type: AonConfigVersion,
    },
    rule: RuleType.array()
  })
  version: AonConfigVersion[];


  @Attribute({ type:DataTypes.JSON(), comment: '外链'})
  @Default([])
  @ApiPropertyRule({ description: '外链', 
    type: 'array',
    items: {
      type: AonDocConfiglinks,
    },
    rule: RuleType.array()
  })
  links: AonDocConfiglinks[];

}
export declare interface AonDocConfig extends BelongsToModel<'icon', File> {}
