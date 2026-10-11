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
    const requestPath = this.ctx.path;
    const normalizePrefix = (value?: string) => {
      const prefix = (value ?? '').trim().replace(/^\/+|\/+$/g, '');
      return prefix ? `/${prefix}` : '';
    };
    const isUnder = (prefix: string) => Boolean(prefix) && (requestPath === prefix || requestPath.startsWith(`${prefix}/`));
    const adminPrefix = normalizePrefix(process.env.VIEW_ADMIN_PATH_PRE) || '/admin';
    const indexPrefix = normalizePrefix(process.env.VIEW_INDEX_PATH_PRE);
    const assign = {
      websiteName: websiteName || process.env.WEBSITE_NAME,
      siteDescription: siteDescription || '',
    };
    if (isUnder(adminPrefix)) return await this.ctx.render('admin', { assign });
    if (!indexPrefix || isUnder(indexPrefix) || requestPath === '/' || requestPath === '/index' || requestPath.startsWith('/index/') || requestPath.startsWith('/aon/')) {
      return await this.ctx.render('index', { assign });
    }
    return '404 not found';
  }
}
