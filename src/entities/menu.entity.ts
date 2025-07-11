import { uuid } from "@/helper/snowflake.js";
import { RuleType } from "@midwayjs/validate";
import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "@sequelize/core";
import { Attribute, CreatedAt, Default, PrimaryKey, Table, UpdatedAt } from "@sequelize/core/decorators-legacy";
import { ApiPropertyRule } from "@/decorators/index.js";

//rule规则使用添加时传入规则
@Table({ tableName: 'menu', comment: '菜单表' })
export class Menu extends Model<
  InferAttributes<Menu>,
  InferCreationAttributes<Menu>
> {
    @Attribute(DataTypes.STRING)
    @PrimaryKey
    @Default(uuid)
    @ApiPropertyRule({ description: 'ID', rule:RuleType.string() })
    id: string;

    @Attribute({
    comment: '父级菜单id',
    type: DataTypes.STRING(100),
    })
    @ApiPropertyRule({ description: '父级id', rule: RuleType.string().max(100) })
    parentId: string;

    @Attribute({
    comment: '菜单名称',
    type: DataTypes.STRING(100),
    })
    @ApiPropertyRule({ description: '菜单名称', rule: RuleType.string().max(100).required()})
    title: string;

    @Attribute({
    comment: '类型:1=目录;2=菜单;3=按钮',
    type: DataTypes.TINYINT.UNSIGNED,
    })
    @ApiPropertyRule({ description: '类型:1=目录;2=菜单;3=按钮', rule: RuleType.number().valid(1,2,3).required() })
    menuType: number;

    @Attribute({
    comment: '状态:1=启用;0=禁用',
    defaultValue: 1,
    type: DataTypes.TINYINT.UNSIGNED,
    })
    @ApiPropertyRule({ description: '状态:1=启用;0=禁用', rule:RuleType.number().valid(1, 0).default(1) })
    status: number;
 
    @Attribute({
    comment: '权限',
    type: DataTypes.STRING(100),
    })
    @ApiPropertyRule({ description: '权限', rule:RuleType.string().max(100).required() })
    rule:string;
    
    @Attribute({
    comment: '排序(降序)',
    type: DataTypes.SMALLINT,
    defaultValue: 0,
    })
    @ApiPropertyRule({ description: '排序(降序)', rule:RuleType.number().integer().max(9999).default(0) })
    orderNum: number

    @Attribute({
    comment: '路径',
    type: DataTypes.STRING(500),
    })
    @ApiPropertyRule({ description: '路径', rule: RuleType.string().max(500).when('menuType', { is: 2, then: RuleType.required() }) })
    path: string;

    @Attribute({
    comment: '外链:1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    })
    @ApiPropertyRule({ description: '外链:1=是;0=否', rule: RuleType.number().valid(0,1).default(0) })
    isLink: number;

    @Attribute({
    comment: '组件路径(相对于views文件夹)',
    type: DataTypes.STRING(500),
    })
    @ApiPropertyRule({ description: '组件路径(相对于views文件夹)', rule: RuleType.string().max(500)
    .when('menuType', { is: 2, then: RuleType.when('isUrl', { is: 0, then: RuleType.required() }) })
    })
    component: string;

    @Attribute({
    comment: '隐藏:1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    })
    @ApiPropertyRule({ description: '隐藏:1=是;0=否', rule:RuleType.number().valid(0,1).default(0) })
    hideMenu:number;

    @Attribute({
    comment: '缓存:1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    })
    @ApiPropertyRule({ description: '缓存:1=是;0=否', rule:RuleType.number().valid(0,1).default(0) })
    cache:number;
        
    @Attribute({
    comment: '图标',
    type: DataTypes.STRING(50),
    })
    @ApiPropertyRule({ description: '图标', rule:RuleType.string().max(50) })
    icon:string;
    
    @Attribute({
    comment: '固定tag:1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    })
    @ApiPropertyRule({ description: '缓存:1=是;0=否', rule:RuleType.number().valid(0,1).default(0) })
    affix:number;
    
    @Attribute({
    comment: '恒定展示(只有一个子元素时不隐藏):1=是;0=否',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 0,
    })
    @ApiPropertyRule({ description: '恒定展示(只有一个子元素时不隐藏):1=是;0=否', rule:RuleType.number().valid(0,1).default(0) })
    alwaysShow:number;
    
    @Attribute({
    comment: '面包屑:1=展示;0=不展示',
    type: DataTypes.TINYINT.UNSIGNED,
    defaultValue: 1,
    })
    @ApiPropertyRule({ description: '面包屑:1=展示;0=不展示', rule:RuleType.number().valid(0,1).default(1) })
    breadcrumb:number;

    @CreatedAt
    @Attribute({ comment: '创建时间' })
    @ApiPropertyRule({ description: '创建时间' })
    declare createdAt: Date;

    @UpdatedAt
    @Attribute({ comment: '最后更新时间' })
    @ApiPropertyRule({ description: '最后更新时间' })
    declare updatedAt: Date;    
}