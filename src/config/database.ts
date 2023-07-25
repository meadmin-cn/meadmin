import { Admin } from '@/app/admin/api/admin/entities/admin.entity';
import { DatabaseConfig } from '@/interfaces/config/database';
import { DatabaseLogger } from '@/logger/database';
import { importModels } from '@sequelize/core';
console.log(__dirname);
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
    timezone: '+08:00', //时区
    logging: new DatabaseLogger().logQuery,
    benchmark: true,
    models: await importModels(
      (__dirname + '/../app/**/*.entity.{ts,js}').replace(/\\/g, '/'),
    ),
    define: {
      underscored: true, //强制表名和列名为snake_case
      timestamps: false, // 禁用createAt和updateAt的自动声明
      noPrimaryKey: true, //禁止自动创建主键id
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    },
  },
];
