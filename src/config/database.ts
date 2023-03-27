import { TypeOrmModuleOptions } from '@nestjs/typeorm';

//数据库配置 数组形式便于声明多数据库
export default () =>
  [
    {
      name: 'default', //多数据库别名
      type: 'mysql',
      database: 'meadmin', //数据库名称
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.APP_PORT ?? '3306', 10),
      username: process.env.DATABASE_USER ?? 'root',
      password: process.env.DATABASE_PASSWORD ?? 'root',
      charset: 'utf8mb4',
      timezone: '+08:00', //时区
      synchronize: false, //自动同步结构
    },
  ] as TypeOrmModuleOptions[];
