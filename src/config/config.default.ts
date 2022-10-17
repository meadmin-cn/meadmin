import { MidwayConfig } from '@midwayjs/core';
export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1665640701003_3870',
  koa: {
    port: 7001,
  },
  meSwagger: {
    module: {
      admin: {
        name: 'admin',
        pathRule: (path: string) => path.startsWith('/api/admin'),
      },
      // index:{
      //   name:'index',
      //   pathRule:(path:string)=>path.startsWith('/api/index')
      // }
    },
  },
} as MidwayConfig;
