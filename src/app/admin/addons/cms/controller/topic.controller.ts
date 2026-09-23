import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { CmsQueryDto } from '../dto/common.dto.js';
import { AonCmsTopicSaveDto } from '../dto/topic.dto.js';
import { AonCmsTopicService } from '../service/topic.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

@Controller('addons/cms/topic', { middleware: [CmsPermissionMiddleware] })
export class AonCmsTopicController extends BaseController {
  @Inject() service: AonCmsTopicService;
  @Post('/')
  @AdminPermission('aon_cms_topic_list')
  async list(@Body() query: CmsQueryDto) {
    return this.success(await this.service.list(query));
  }
  @Get('/info/:id')
  @AdminPermission(['aon_cms_topic_info', 'aon_cms_topic_edit'])
  async info(@Param('id') id: string) {
    return this.success(await this.service.info(id));
  }
  @Post('/add')
  @AdminPermission('aon_cms_topic_add')
  async add(@Body() data: AonCmsTopicSaveDto) {
    return this.success(await this.service.save(undefined, data));
  }
  @Post('/up/:id')
  @AdminPermission('aon_cms_topic_edit')
  async update(@Param('id') id: string, @Body() data: AonCmsTopicSaveDto) {
    return this.success(await this.service.save(id, data));
  }
  @Post('/del/:id')
  @AdminPermission('aon_cms_topic_del')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return this.success();
  }
}
