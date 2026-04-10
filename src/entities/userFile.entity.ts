import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, NonAttribute } from '@sequelize/core';
import { DataTypes } from '@sequelize/core';
import { Attribute, Default, HasMany, PrimaryKey, Table } from '@sequelize/core/decorators-legacy';
import { IndexBaseModel } from './abstract/indexBase.entity.js';
import { User } from './user.entity.js';

//rule规则使用添加接口的校验规则
@Table({ tableName: 'user_file', comment: '用户附件表(前台)' })
export class UserFile extends IndexBaseModel<UserFile> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>;//CreationOptional标记在模型创建过程中可以省略的属性。用于具有默认值或标记为自动生成的属性。
  
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
  get url(): CreationOptional<string> {
    return '/api/index/file/get/' + this.id + '/' + this.name;
  }

  //为了规避user和userFile的循环引用问题，在userFile声明user avatar的关联
  @HasMany(() => User, {
    foreignKey: 'avatarFileId',
    inverse: { as: 'avatar' },
    foreignKeyConstraints: false, //数据库不创建外键，外键应用层解决
  })
  declare avatarUsers?: NonAttribute<User[]>;

  //json转义需要加上url属性，否则创建成功后的返回实体没有对应参数返回
  toJSON() {
    return Object.assign(
      { url: this.url as string },
      this.get({
        plain: true,
      }),
    );
  }
}
