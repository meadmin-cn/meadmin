import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { AonCmsCommentSaveDto } from '../dto/comment.dto.js';
import { CmsQueryDto, CmsReviewDto } from '../dto/common.dto.js';
import { AonCmsCommentService } from '../service/comment.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

@Controller('addons/cms/comment', { middleware: [CmsPermissionMiddleware] })
export class AonCmsCommentController extends BaseController {
  @Inject() service: AonCmsCommentService;
  @Post('/')
  @AdminPermission('aon_cms_comment_list')
  async list(@Body() query: CmsQueryDto) {
    return this.success(await this.service.list(query));
  }
  @Get('/info/:id')
  @AdminPermission(['aon_cms_comment_info', 'aon_cms_comment_edit'])
  async info(@Param('id') id: string) {
    return this.success(await this.service.info(id));
  }
  @Post('/add')
  @AdminPermission('aon_cms_comment_add')
  async add(@Body() data: AonCmsCommentSaveDto) {
    return this.success(await this.service.save(undefined, data));
  }
  @Post('/up/:id')
  @AdminPermission('aon_cms_comment_edit')
  async update(@Param('id') id: string, @Body() data: AonCmsCommentSaveDto) {
    return this.success(await this.service.save(id, data));
  }
  @Post('/del/:id')
  @AdminPermission('aon_cms_comment_del')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return this.success();
  }

  @Post('/review/:id')
  @AdminPermission('aon_cms_comment_review')
  async review(@Param('id') id: string, @Body() data: CmsReviewDto) {
    return this.success(await this.service.review(id, data));
  }
}
