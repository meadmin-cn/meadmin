import { importModels, Options } from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
export default async () => ({
  dataSource: {
    default: {
      dialect: PostgresDialect,
      host: process.env.DATABASE_HOST ?? '127.0.0.1',
      port: process.env.DATABASE_PORT ?? 5342,
      database: process.env.DATABASE_DB ?? 'meadmin',
      user: process.env.DATABASE_USER ?? 'root',
      password: process.env.DATABASE_PASSWORD ?? 'root',
      client_encoding: 'utf8',
      models: await importModels(
        (import.meta.dirname + '/../**/*.entity.{ts,js}').replace(
          /\\/g,
          '/'
        )
      ),
      define: {
        underscored: true, //强制表名和列名不转换为snake_case
        freezeTableName: true, //强制模型名称不变换（取消表名的单词复数转换和snake_case转换)
        timestamps: false, // 禁用createAt和updateAt的自动声明
        noPrimaryKey: true, //禁止自动创建主键id
        schema: process.env.DATABASE_SCHEMA ?? 'public',
        timezone: 'Asia/Shanghai',
      },
    } as Options<PostgresDialect>,
  },
});
