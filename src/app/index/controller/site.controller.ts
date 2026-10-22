import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SystemSiteService } from '../../admin/service/system/site.service.js';
import { BaseController } from './base.controller.js';

/**
 * 前台公开接口：按访问域名返回当前站点的伪静态配置。
 * 前端 CSR 兜底时可通过该接口读取，不附加鉴权。
 */
@Controller('site')
export class SiteController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  systemSiteService: SystemSiteService;

  @Get('/config')
  async config() {
    const site = await this.systemSiteService.resolveByHost(this.ctx.host);
    return this.success({
      site: site ? { name: site.name, basePath: site.basePath } : null,
      rules: site?.rules ?? [],
    });
  }
}
