import { DatabaseConfig } from '@/interfaces/config/database';
import { DatabaseLogger } from '@/logger/database';
import { join } from 'node:path';
//数据库配置 数组形式便于声明多数据库
export default (): DatabaseConfig[] => [
  {
    name: 'default', //多数据库别名
    type: 'mysql',
    database: process.env.DATABASE ?? 'meadmin', //数据库名称
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
    username: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? 'root',
    charset: 'utf8mb4',
    timezone: 'local', //时区
    dropSchema: process.env.DATABASE_DROPSCHEMA === 'true', //每次初始化数据源时删除架构。 请注意此选项，不要在生产中使用它 - 否则将丢失所有生产数据。
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true', // 自动同步结构 一定要设置成false 否则会自动读取entity修改数据库
    autoLoadEntities: true, // 自动加载实体
    logger: new DatabaseLogger(),
    logging: 'all',
    entities: [
      join(__dirname, '../app/**/*.entity{.js,.ts}').replace(/\\/g, '/'),
    ],
  },
];
