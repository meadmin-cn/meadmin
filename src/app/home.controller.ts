import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Get('*')
  async home() {
    if (this.ctx.originalUrl.startsWith(process.env.VIEW_ADMIN_PATH_PRE + '/'.replaceAll('//', '/')) || this.ctx.originalUrl === process.env.VIEW_ADMIN_PATH_PRE) {
      return await this.ctx.render('admin', {
        assign: {
          //替换html元素
          websiteName: process.env.WEBSITE_NAME,
        },
      });
    }
    if (this.ctx.originalUrl.startsWith(process.env.VIEW_INDEX_PATH_PRE + '/'.replaceAll('//', '/')) || this.ctx.originalUrl === process.env.VIEW_INDEX_PATH_PRE) {
      return await this.ctx.render('index', {
        assign: {
          //替换html元素,同时会传入server ctx
          websiteName: process.env.WEBSITE_NAME,
        },
      });
    }
    return '404 not found';
  }
}
