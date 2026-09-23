import { AdminPermission } from '@/decorators/index.js';
import { Controller, Get, Inject } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { AonCmsStatisticsService } from '../service/statistics.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

@Controller('addons/cms/statistics', { middleware: [CmsPermissionMiddleware] })
export class AonCmsStatisticsController extends BaseController {
  @Inject() service: AonCmsStatisticsService;
  @Get('/')
  @AdminPermission('aon_cms_statistics_list')
  async summary() {
    return this.success(await this.service.summary());
  }
}
