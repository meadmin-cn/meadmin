import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs';

//数据库配置 数组形式便于声明多数据库
export default () =>
  [
    {
      contextName: 'core', //多数据库别名
      registerRequestContext: false, // disable automatatic middleware
      dbName: 'meadmin', //数据库名称
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.APP_PORT ?? '3306', 10),
      user: process.env.DATABASE_USER ?? 'root',
      password: process.env.DATABASE_PASSWORD ?? 'root',
      charset: 'utf8mb4',
      type: 'mysql',
      timezone: '+08:00', //时区
      debug: process.env.NODE_ENV === 'development' ? true : [], // or provide array like `['query' , 'query-params' , 'discovery' , 'info']`
    },
  ] as MikroOrmModuleSyncOptions[];
