import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { DefaultErrorFilter } from './filter/default.filter.js';
import { NotFoundFilter } from './filter/notfound.filter.js';
// import { ReportMiddleware } from './middleware/report.middleware.js';
import DefaultConfig from '@/config/config.default.js';
import UnittestConfig from '@/config/config.unittest.js';
import * as meadmin from '@meadmin/core';
import { ValidateErrorFilter } from './filter/validate.filter.js';
import * as swagger from '@midwayjs/swagger';
import dotenv from 'dotenv';

// 根据当前环境加载不同的 .env 文件
if (process.env.NODE_ENV) {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
} else {
  dotenv.config({ path: '.env' });
}
@Configuration({
  imports: [
    koa,
    meadmin, //必须放在swagger之前引入
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    {
      component: swagger,
      enabledEnvironment: ['local', 'dev'],
    },
  ],
  importConfigs: [
    {
      default: DefaultConfig,
      unittest: UnittestConfig,
    },
  ],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  async onReady() {
    // add middleware
    // this.app.useMiddleware([ReportMiddleware]);
    // add filter
    this.app.useFilter([
      ValidateErrorFilter,
      NotFoundFilter,
      DefaultErrorFilter,
    ]);
  }
}
