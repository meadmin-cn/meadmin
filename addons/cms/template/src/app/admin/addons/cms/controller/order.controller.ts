import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { CmsQueryDto } from '../dto/common.dto.js';
import { AonCmsOrderService } from '../service/order.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

@Controller('addons/cms/order', { middleware: [CmsPermissionMiddleware] })
export class AonCmsOrderController extends BaseController {
  @Inject() service: AonCmsOrderService;

  @Post('/')
  @AdminPermission('aon_cms_order_list')
  async list(@Body() query: CmsQueryDto) {
    return this.success(await this.service.list(query));
  }

  @Get('/info/:id')
  @AdminPermission(['aon_cms_order_info', 'aon_cms_order_edit'])
  async info(@Param('id') id: string) {
    return this.success(await this.service.info(id));
  }

  @Post('/status/:id')
  @AdminPermission('aon_cms_order_edit')
  async updateStatus(@Param('id') id: string, @Body() data: { status: number; paymentStatus: number }) {
    return this.success(await this.service.updateStatus(id, data));
  }
}
