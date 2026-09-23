import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { AonCmsCategorySaveDto } from '../dto/category.dto.js';
import { CmsQueryDto } from '../dto/common.dto.js';
import { AonCmsCategoryService } from '../service/category.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

@Controller('addons/cms/category', { middleware: [CmsPermissionMiddleware] })
export class AonCmsCategoryController extends BaseController {
  @Inject() service: AonCmsCategoryService;
  @Post('/')
  @AdminPermission('aon_cms_category_list')
  async list(@Body() query: CmsQueryDto) {
    return this.success(await this.service.list(query));
  }
  @Get('/info/:id')
  @AdminPermission(['aon_cms_category_info', 'aon_cms_category_edit'])
  async info(@Param('id') id: string) {
    return this.success(await this.service.info(id));
  }
  @Post('/add')
  @AdminPermission('aon_cms_category_add')
  async add(@Body() data: AonCmsCategorySaveDto) {
    return this.success(await this.service.save(undefined, data));
  }
  @Post('/up/:id')
  @AdminPermission('aon_cms_category_edit')
  async update(@Param('id') id: string, @Body() data: AonCmsCategorySaveDto) {
    return this.success(await this.service.save(id, data));
  }
  @Post('/del/:id')
  @AdminPermission('aon_cms_category_del')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return this.success();
  }
  @Get('/tree')
  @AdminPermission(['aon_cms_category_list', 'aon_cms_category_add', 'aon_cms_category_edit', 'aon_cms_article_add', 'aon_cms_article_edit', 'aon_cms_article_info', 'aon_cms_category_info'])
  async tree() {
    return this.success(await this.service.tree());
  }
}
