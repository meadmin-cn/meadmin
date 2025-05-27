import { importModels, Options } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: 'default', //数据库配置别名
  dialect: PostgresDialect,
  connectionSteing: `postgres://${process.env.DATABASE_USER ?? 'root'}:${
    process.env.DATABASE_PASSWORD ?? 'root'
  }@${process.env.DATABASE_HOST ?? '127.0.0.1'}:${
    process.env.DATABASE_PORT ?? '5342'
  }/${process.env.DATABASE_DB}?currentSchema${
    process.env.DATABASE_SCHEMA
  }&TimeZone=Asia/Shanghai`, //数据库连接信息
  client_encoding: 'utf8',
  models: await importModels(
    (__dirname + '/../app/**/*.entity.{ts,js}').replace(/\\/g, '/')
  ),
  define: {
    underscored: true, //强制表名和列名为snake_case
    freezeTableName: true, //取消表名的单词复数转换
    timestamps: false, // 禁用createAt和updateAt的自动声明
    noPrimaryKey: true, //禁止自动创建主键id
    charset: 'utf8',
    collate: 'utf8_general_ci',
  },
} as Options<PostgresDialect>;
