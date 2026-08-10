import { ApiPropertyRule } from '@/decorators/index.js';
import { uuid } from '@/helper/snowflake.js';
import { RuleType } from '@/ruleType/index.js';
import { CreationOptional, DataTypes } from '@sequelize/core';
import { Attribute, Default, PrimaryKey, Table, Unique } from '@sequelize/core/decorators-legacy';
import { AdminBaseModel } from './abstract/adminBase.entity.js';

//rule规则使用添加接口的校验规则
@Table({ tableName: 'job', comment: '任务表' })
export class Job extends AdminBaseModel<Job> {
  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @PrimaryKey
  @Default(uuid)
  @ApiPropertyRule({ description: 'ID', rule: RuleType.string() })
  id: CreationOptional<string>; //CreationOptional 是 Sequelize 提供的一个类型，用于表示在创建实例时可以省略的属性，因为它们会由数据库自动生成或有默认值。

  @Unique()
  @Attribute({ type: DataTypes.STRING(50), comment: '任务名称', allowNull: false, defaultValue: '' })
  @ApiPropertyRule({ description: '任务名称', rule: RuleType.string().max(300).min(1).required().empty('') })
  name: string;

  @Attribute({
    comment: '执行策略:1=立即执行;2=延时执行;3=定时执行;4=放弃执行',
    defaultValue: 1,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '执行策略:1=立即执行;2=延时执行;3=定时执行;4=放弃执行', rule: RuleType.number().equal(1, 2, 3, 4).required() })
  strategy: 1 | 2 | 3 | 4;

  @Attribute({
    comment: '延时时间(s)',
    defaultValue: 0,
    allowNull: false,
    type: DataTypes.INTEGER.UNSIGNED,
  })
  @ApiPropertyRule({
    description: '延时时间(s)',
    rule: RuleType.number().integer().min(0).when('strategy', {
      is: 2,
      then: RuleType.required(),
    }),
  })
  delay: number;

  @Attribute({
    comment: '定时表达式(cron)',
    defaultValue: '',
    allowNull: false,
    type: DataTypes.STRING(200),
  })
  @ApiPropertyRule({
    description: '定时表达式(cron)',
    rule: RuleType.string().when('strategy', {
      is: 3,
      then: RuleType.required(),
    }),
  })
  cron: string;

  //可重复，允许并行；去重，当有任务正在处理，后续任务不再执行；覆盖，当有任务正在处理，后续任务会等待知道前一个任务完成，但是多个等待任务会只执行最后一个
  @Attribute({
    comment: '去重策略:1=可重复;2=去重;3=覆盖',
    defaultValue: 1,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '去重策略:1=可重复;2=去重;3=覆盖', rule: RuleType.number().equal(1, 2, 3).required() })
  deduplication: 1 | 2 | 3;

  @Attribute({ type: DataTypes.STRING(20), allowNull: false })
  @ApiPropertyRule({ description: '任务id', rule: RuleType.string() })
  jobId: string;

  @Attribute({ comment: '任务进度', type: DataTypes.DOUBLE(3, 2), allowNull: false })
  @ApiPropertyRule({ description: '任务进度', rule: RuleType.number().min(0).max(100) })
  progress: number;

  @Attribute({
    comment: '任务类型:1=sql;2=url请求;3=自定义',
    defaultValue: 1,
    allowNull: false,
    type: DataTypes.TINYINT.UNSIGNED,
  })
  @ApiPropertyRule({ description: '任务类型:1=sql;2=url请求;3=自定义', rule: RuleType.number().equal(1, 2, 3).required() })
  type: 1 | 2 | 3;

  @Attribute({
    comment: 'sql语句',
    type: DataTypes.TEXT,
    allowNull: false,
  })
  @ApiPropertyRule({
    description: 'sql语句',
    rule: RuleType.string().when('type', {
      is: 1,
      then: RuleType.required(),
    }),
  })
  sql: string;

  @Attribute({
    comment: 'url请求地址',
    type: DataTypes.STRING(200),
    allowNull: false,
  })
  @ApiPropertyRule({
    description: 'url请求地址',
    rule: RuleType.string().when('type', {
      is: 2,
      then: RuleType.required(),
    }),
  })
  url: string;

  @Attribute({
    comment: '请求方法',
    type: DataTypes.STRING(10),
    allowNull: false,
  })
  @ApiPropertyRule({
    description: '请求方法:GET=GET请求;POST=POST请求;PUT=PUT请求;DELETE=DELETE请求',
    rule: RuleType.string().equal('GET', 'POST', 'PUT', 'DELETE').when('type', {
      is: 2,
      then: RuleType.required(),
    }),
  })
  method: string;

  @Attribute({
    comment: '请求头',
    type: DataTypes.TEXT,
    allowNull: false,
  })
  @ApiPropertyRule({
    description: '请求头(json格式)',
    rule: RuleType.string().when('type', {
      is: 2,
      then: RuleType.required(),
    }),
  })
  headers: string;

  @Attribute({
    comment: 'POST请求体(json格式)',
    type: DataTypes.TEXT,
    allowNull: false,
  })
  @ApiPropertyRule({
    description: 'POST请求体(json格式)',
    rule: RuleType.string().when('type', {
      is: 2,
      then: RuleType.required(),
    }),
  })
  body: string;

  @Attribute({
    comment: 'GET参数(json格式)',
    type: DataTypes.TEXT,
    allowNull: false,
  })
  @ApiPropertyRule({
    description: 'GET参数(json格式)',
    rule: RuleType.string().when('type', {
      is: 2,
      then: RuleType.required(),
    }),
  })
  query: string;

  //自定义任务处理器 对应Processor的queueName
  @Attribute({
    comment: '自定义任务处理器',
    type: DataTypes.STRING(200),
    allowNull: false,
  })
  @ApiPropertyRule({
    description: '自定义任务处理器',
    rule: RuleType.string().when('type', {
      is: 3,
      then: RuleType.required(),
    }),
  })
  queueName: string;

  @Attribute({
    comment: '自定义任务处理器参数(json格式)',
    type: DataTypes.TEXT,
    allowNull: false,
  })
  @ApiPropertyRule({ description: '自定义任务处理器参数(json格式)', rule: RuleType.string() })
  queueOptions: string;

  @Attribute({
    comment: '任务状态:active=执行中;completed=已完成;failed=失败;waiting=等待中',
    type: DataTypes.STRING(20),
    allowNull: false,
  })
  @ApiPropertyRule({ description: '任务状态:active=执行中;completed=已完成;failed=失败;waiting=等待中', rule: RuleType.string().equal('active', 'completed', 'failed', 'waiting').required() })
  status: 'active' | 'completed' | 'failed' | 'waiting';

  @Attribute({
    comment: '任务执行结果',
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  })
  @ApiPropertyRule({ description: '任务执行结果', rule: RuleType.string() })
  result: string;

  @Attribute({
    comment: '任务执行成功数',
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  })
  @ApiPropertyRule({ description: '任务执行成功数', rule: RuleType.number().integer().min(0) })
  sucessedNum: number;

  @Attribute({
    comment: '任务执行失败数',
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  })
  @ApiPropertyRule({ description: '任务执行失败数', rule: RuleType.number().integer().min(0) })
  failedNum: number;

  @Attribute({
    comment: '任务执行失败响应',
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
  })
  @ApiPropertyRule({ description: '任务执行失败响应', rule: RuleType.string() })
  failedResponse: string;
}
