import { DatabaseConfig } from '@/interfaces/config/database';
import { DatabaseLogger } from '@/logger/database';
import { importModels } from '@sequelize/core';

//数据库配置 数组形式便于声明多数据库
export default async (): Promise<DatabaseConfig[]> => [
  {
    name: 'default', //多数据库别名
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
    database: process.env.DATABASE ?? 'meadmin', //数据库名称
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
    username: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? 'root',
    timezone: 'local', //时区
    logging: (...msg) => console.log(msg),
    models: await importModels(__dirname + '../app/**/*.entity{.js,.ts}'),
    define: {
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
  },
];
