import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ConfigService } from './index/service/config.service.js';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Inject()
  configService: ConfigService;

  @Get('*')
  async home() {
    const baseConfig = await this.configService.getValues('base');
    const websiteName = this.configService.valuesToValue(baseConfig, 'site_name');
    const siteDescription = this.configService.valuesToValue(baseConfig, 'site_description');
    if (this.ctx.originalUrl.startsWith(process.env.VIEW_ADMIN_PATH_PRE + '/'.replaceAll('//', '/')) || this.ctx.originalUrl === process.env.VIEW_ADMIN_PATH_PRE) {
      return await this.ctx.render('admin', {
        assign: {
          //替换html元素
          websiteName: websiteName || process.env.WEBSITE_NAME,
          siteDescription: siteDescription || '',
        },
      });
    }
    if (this.ctx.originalUrl.startsWith(process.env.VIEW_INDEX_PATH_PRE + '/'.replaceAll('//', '/')) || this.ctx.originalUrl === process.env.VIEW_INDEX_PATH_PRE) {
      return await this.ctx.render('index', {
        assign: {
          //替换html元素,同时会传入server ctx
          websiteName: websiteName || process.env.WEBSITE_NAME,
          siteDescription: siteDescription || '',
        },
      });
    }
    return '404 not found';
  }
}
