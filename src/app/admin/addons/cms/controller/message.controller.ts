import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { CmsQueryDto } from '../dto/common.dto.js';
import { CmsMessageSaveDto } from '../dto/message.dto.js';
import { AonCmsMessageService } from '../service/message.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';
@Controller('addons/cms/message', { middleware: [CmsPermissionMiddleware] })
export class AonCmsMessageController extends BaseController {
  @Inject() service: AonCmsMessageService;
  @Post('/') @AdminPermission('aon_cms_message_list') async list(@Body() data: CmsQueryDto) { return this.success(await this.service.list(data)); }
  @Get('/info/:id') @AdminPermission(['aon_cms_message_info','aon_cms_message_edit']) async info(@Param('id') id: string) { return this.success(await this.service.info(id)); }
  @Post('/up/:id') @AdminPermission('aon_cms_message_edit') async update(@Param('id') id: string, @Body() data: CmsMessageSaveDto) { return this.success(await this.service.update(id, data)); }
  @Post('/del/:id') @AdminPermission('aon_cms_message_del') async remove(@Param('id') id: string) { await this.service.remove(id); return this.success(); }
}
