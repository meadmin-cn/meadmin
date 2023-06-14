import { DatabaseConfig } from '@/interfaces/config/database';
import { DatabaseLogger } from '@/logger/database';
import { join } from 'node:path';
//数据库配置 数组形式便于声明多数据库
export default (): DatabaseConfig[] => [
  {
    name: 'default', //多数据库别名
    type: 'mysql',
    database: 'meadmin', //数据库名称
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
    username: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? 'root',
    charset: 'utf8mb4',
    timezone: 'local', //时区
    synchronize: false, // 自动同步结构 一定要设置成false 否则会自动读取entity修改数据库
    autoLoadEntities: true, // 自动加载实体
    logger: new DatabaseLogger(),
    logging: 'all',
    entities: [join(__dirname, '../**/*.entity{.js,.ts}').replace(/\\/g, '/')],
  },
];
