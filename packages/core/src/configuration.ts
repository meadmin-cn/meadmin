import { Configuration, App } from '@midwayjs/core';
import * as DefaultConfig from './config/config.default.js';
import * as koa from '@midwayjs/koa';

@Configuration({
  namespace: 'book',
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class BookConfiguration {
  @App('koa')
  app: koa.Application;
  async onReady() {
    // TODO something1
  }
}
