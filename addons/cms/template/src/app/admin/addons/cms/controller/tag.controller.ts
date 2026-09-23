import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { CmsQueryDto } from '../dto/common.dto.js';
import { AonCmsTagSaveDto } from '../dto/tag.dto.js';
import { AonCmsTagService } from '../service/tag.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

@Controller('addons/cms/tag', { middleware: [CmsPermissionMiddleware] })
export class AonCmsTagController extends BaseController {
  @Inject() service: AonCmsTagService;
  @Post('/')
  @AdminPermission('aon_cms_tag_list')
  async list(@Body() query: CmsQueryDto) {
    return this.success(await this.service.list(query));
  }
  @Get('/info/:id')
  @AdminPermission(['aon_cms_tag_info', 'aon_cms_tag_edit'])
  async info(@Param('id') id: string) {
    return this.success(await this.service.info(id));
  }
  @Post('/add')
  @AdminPermission('aon_cms_tag_add')
  async add(@Body() data: AonCmsTagSaveDto) {
    return this.success(await this.service.save(undefined, data));
  }
  @Post('/up/:id')
  @AdminPermission('aon_cms_tag_edit')
  async update(@Param('id') id: string, @Body() data: AonCmsTagSaveDto) {
    return this.success(await this.service.save(id, data));
  }
  @Post('/del/:id')
  @AdminPermission('aon_cms_tag_del')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return this.success();
  }
}
