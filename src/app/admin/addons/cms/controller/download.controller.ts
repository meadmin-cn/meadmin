import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { CmsQueryDto } from '../dto/common.dto.js';
import { CmsDownloadSaveDto } from '../dto/download.dto.js';
import { AonCmsDownloadService } from '../service/download.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';
@Controller('addons/cms/download', { middleware: [CmsPermissionMiddleware] })
export class AonCmsDownloadController extends BaseController {
  @Inject() service: AonCmsDownloadService;
  @Post('/') @AdminPermission('aon_cms_download_list') async list(@Body() data: CmsQueryDto) { return this.success(await this.service.list(data)); }
  @Get('/info/:id') @AdminPermission(['aon_cms_download_info','aon_cms_download_edit']) async info(@Param('id') id: string) { return this.success(await this.service.info(id)); }
  @Post('/add') @AdminPermission('aon_cms_download_add') async add(@Body() data: CmsDownloadSaveDto) { return this.success(await this.service.save(undefined, data)); }
  @Post('/up/:id') @AdminPermission('aon_cms_download_edit') async update(@Param('id') id: string, @Body() data: CmsDownloadSaveDto) { return this.success(await this.service.save(id, data)); }
  @Post('/del/:id') @AdminPermission('aon_cms_download_del') async remove(@Param('id') id: string) { await this.service.remove(id); return this.success(); }
}
