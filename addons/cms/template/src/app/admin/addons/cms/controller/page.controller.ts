import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { Validate } from '@midwayjs/validate';
import { BaseController } from '../../../controller/base.controller.js';
import { CmsQueryDto, CmsReviewDto } from '../dto/common.dto.js';
import { AonCmsPageSaveDto } from '../dto/page.dto.js';
import { AonCmsPageService } from '../service/page.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

@Controller('addons/cms/page', { middleware: [CmsPermissionMiddleware] })
export class AonCmsPageController extends BaseController {
  @Inject() service: AonCmsPageService;
  @Post('/')
  @AdminPermission('aon_cms_page_list')
  async list(@Body() query: CmsQueryDto) {
    return this.success(await this.service.list(query));
  }
  @Get('/info/:id')
  @AdminPermission(['aon_cms_page_info', 'aon_cms_page_edit'])
  async info(@Param('id') id: string) {
    return this.success(await this.service.info(id));
  }
  @Post('/add')
  @Validate({ validationOptions: { stripUnknown: false, allowUnknown: false } })
  @AdminPermission('aon_cms_page_add')
  async add(@Body() data: AonCmsPageSaveDto) {
    return this.success(await this.service.save(undefined, data));
  }
  @Post('/up/:id')
  @Validate({ validationOptions: { stripUnknown: false, allowUnknown: false } })
  @AdminPermission('aon_cms_page_edit')
  async update(@Param('id') id: string, @Body() data: AonCmsPageSaveDto) {
    return this.success(await this.service.save(id, data));
  }
  @Post('/del/:id')
  @AdminPermission('aon_cms_page_del')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return this.success();
  }

  @Post('/submit/:id')
  @AdminPermission('aon_cms_page_edit')
  async submit(@Param('id') id: string) {
    return this.success(await this.service.submit(id));
  }
  @Post('/offline/:id')
  @AdminPermission('aon_cms_page_review')
  async offline(@Param('id') id: string) {
    return this.success(await this.service.offline(id));
  }
  @Get('/review-history/:id')
  @AdminPermission(['aon_cms_page_info', 'aon_cms_page_review'])
  async reviewHistory(@Param('id') id: string) {
    return this.success(await this.service.reviewHistory(id));
  }
  @Post('/review/:id')
  @AdminPermission('aon_cms_page_review')
  async review(@Param('id') id: string, @Body() data: CmsReviewDto) {
    return this.success(await this.service.review(id, data));
  }
}
