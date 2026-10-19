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
    // vite 开发中间件在处理非静态资源请求时会 strip base 改写 req.url（/admin/login → /login），
    // 导致 ctx.path 丢失 /admin 前缀、误判为前台路由；用 originalUrl 保留原始路径。
    // 生产环境无该改写，originalUrl 与 path 一致，行为不变。
    const requestPath = (this.ctx.originalUrl || this.ctx.path).split('?')[0];
    const normalizePrefix = (value?: string) => {
      const prefix = (value ?? '').trim().replace(/^\/+|\/+$/g, '');
      return prefix ? `/${prefix}` : '';
    };
    const isUnder = (prefix: string) => Boolean(prefix) && (requestPath === prefix || requestPath.startsWith(`${prefix}/`));
    const adminPrefix = normalizePrefix(process.env.VIEW_ADMIN_PATH_PRE) || '/admin';
    const indexPrefix = normalizePrefix(process.env.VIEW_INDEX_PATH_PRE);
    const assign = {
      // 替换 html 元素，同时会传入服务端渲染上下文。
      websiteName: websiteName || process.env.WEBSITE_NAME,
      siteDescription: siteDescription || '',
    };
    if (isUnder(adminPrefix)) {
      return await this.ctx.render('admin', { assign });
    }
    if (!indexPrefix || isUnder(indexPrefix) || requestPath === '/' || requestPath === '/index' || requestPath.startsWith('/index/') || requestPath.startsWith('/aon/')) {
      return await this.ctx.render('index', { assign });
    }
    return '404 not found';
  }
}
