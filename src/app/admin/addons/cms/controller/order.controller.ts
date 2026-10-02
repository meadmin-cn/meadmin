import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { CmsAdminOrderListDto, CmsOrderEditDto, CmsOrderFollowDto, CmsOrderPayDto, CmsOrderReasonDto, CmsOrderShipDto } from '../dto/order.dto.js';
import { AonCmsOrderService } from '../service/order.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

@Controller('addons/cms/order', { middleware: [CmsPermissionMiddleware] })
export class AonCmsOrderController extends BaseController {
  @Inject() service: AonCmsOrderService;

  @Post('/')
  @AdminPermission('aon_cms_order_list')
  async list(@Body() query: CmsAdminOrderListDto) {
    return this.success(await this.service.list(query));
  }

  @Get('/summary')
  @AdminPermission('aon_cms_order_list')
  async summary() {
    return this.success(await this.service.summary());
  }

  @Get('/info/:id')
  @AdminPermission(['aon_cms_order_info', 'aon_cms_order_edit'])
  async info(@Param('id') id: string) {
    return this.success(await this.service.detail(id));
  }

  @Post('/edit/:id')
  @AdminPermission('aon_cms_order_edit')
  async edit(@Param('id') id: string, @Body() data: CmsOrderEditDto) {
    return this.success(await this.service.edit(id, data));
  }

  @Post('/pay/:id')
  @AdminPermission('aon_cms_order_pay')
  async pay(@Param('id') id: string, @Body() data: CmsOrderPayDto) {
    return this.success(await this.service.pay(id, data));
  }

  @Post('/ship/:id')
  @AdminPermission('aon_cms_order_ship')
  async ship(@Param('id') id: string, @Body() data: CmsOrderShipDto) {
    return this.success(await this.service.ship(id, data));
  }

  @Post('/receive/:id')
  @AdminPermission('aon_cms_order_ship')
  async receive(@Param('id') id: string, @Body() data: CmsOrderReasonDto) {
    return this.success(await this.service.receive(id, data));
  }

  @Post('/follow/:id')
  @AdminPermission('aon_cms_order_follow')
  async follow(@Param('id') id: string, @Body() data: CmsOrderFollowDto) {
    return this.success(await this.service.follow(id, data));
  }

  @Post('/complete/:id')
  @AdminPermission('aon_cms_order_complete')
  async complete(@Param('id') id: string, @Body() data: CmsOrderReasonDto) {
    return this.success(await this.service.complete(id, data));
  }

  @Post('/close/:id')
  @AdminPermission('aon_cms_order_close')
  async close(@Param('id') id: string, @Body() data: CmsOrderReasonDto) {
    return this.success(await this.service.close(id, data));
  }

  @Post('/delete')
  @AdminPermission('aon_cms_order_del')
  async destroy(@Body('ids') ids: string[]) {
    await this.service.destroy(ids);
    return this.success();
  }
}
