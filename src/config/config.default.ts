import { MidwayConfig } from '@midwayjs/core';
import { importModels } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1714030878233_897',
  koa: {
    port: 7001,
  },
  debug: true,
  validate: {
    validationOptions: {
      allowUnknown: true, // 全局生效 允许未定义的字段
      convert: true, // 当为true时，尝试将值转换为所需的类型（例如，将字符串转换为数字.
      stripUnknown: true, // 全局生效,移除多余的字段
    },
  },
  database: {
    name: 'default', //数据库配置别名
    dialect: PostgresDialect,
    connectionSteing: `postgres://${process.env.DATABASE_USER ?? 'root'}:${
      process.env.DATABASE_PASSWORD ?? 'root'
    }@${process.env.DATABASE_HOST ?? '127.0.0.1'}:${
      process.env.DATABASE_PORT ?? '5342'
    }/meadmin?currentSchema=meadmin&TimeZone=Asia/Shanghai`, //数据库连接信息
    client_encoding: 'utf8',
    timezone: '+08:00', //时区
    models: await importModels(
      (__dirname + '/../app/**/*.entity.{ts,js}').replace(/\\/g, '/')
    ),
    define: {
      underscored: true, //强制表名和列名为snake_case
      freezeTableName: true,//取消表名的单词复数转换
      timestamps: false, // 禁用createAt和updateAt的自动声明
      noPrimaryKey: true, //禁止自动创建主键id
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  },
} as MidwayConfig;
