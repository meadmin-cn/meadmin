import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SystemSiteService } from './admin/service/system/site.service.js';
import { ConfigService } from './index/service/config.service.js';

@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Inject()
  configService: ConfigService;

  @Inject()
  systemSiteService: SystemSiteService;

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
      // 按访问域名解析站点伪静态配置，注入 SSR 上下文与 HTML（供浏览器端路由复用）。
      // 查询失败不能影响页面渲染，缺失配置时保持框架默认行为。
      let siteConfig: string | undefined;
      try {
        const resolved = await this.systemSiteService.resolveByHost(this.ctx.host);
        if (resolved) siteConfig = JSON.stringify({ basePath: resolved.basePath, rules: resolved.rules });
      } catch (error) {
        this.ctx.logger.error('解析站点伪静态配置失败', error);
      }
      return await this.ctx.render('index', { assign: siteConfig ? { ...assign, siteConfig } : assign });
    }
    return '404 not found';
  }
}
