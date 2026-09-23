import { RuleType } from '@/ruleType/index.js';
import { Body, Controller, Get, Inject, Param, Post, Query } from '@midwayjs/core';
import { BadRequestError, UnauthorizedError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';
import { CmsQueryDto } from '../../../../admin/addons/cms/dto/common.dto.js';
import { BaseController } from '../../../controller/base.controller.js';
import { AonCmsPublicService } from '../service/cms.service.js';
import { AonCmsPublicOrderService } from '../service/order.service.js';
import type { CmsOrderCreateDto, CmsOrderQueryDto } from '../../../../admin/addons/cms/dto/order.dto.js';
import { CmsPublicCommentDto } from '../../../../admin/addons/cms/dto/comment.dto.js';
import { CmsNotFoundMiddleware } from './notfound.middleware.js';

const slugValue = (value: string) => {
  if (
    RuleType.string()
      .max(120)
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .required()
      .validate(value).error
  )
    throw new BadRequestError('无效的标识');
  return value;
};
@Controller('addons/cms', { middleware: [CmsNotFoundMiddleware] })
export class AonCmsPublicController extends BaseController {
  @Inject() service: AonCmsPublicService;
  @Inject() orderService: AonCmsPublicOrderService;
  @Inject() ctx: Context;
  @Get('/articles')
  async articles(@Query() query: CmsQueryDto) {
    return this.success(await this.service.articles(query));
  }
  @Get('/article/:slug')
  async article(@Param('slug') slug: string) {
    return this.success(await this.service.articleDetail(slugValue(slug)));
  }
  @Get('/page/:slug')
  async page(@Param('slug') slug: string) {
    return this.success(await this.service.pageDetail(slugValue(slug)));
  }
  @Get('/topic/:slug')
  async topic(@Param('slug') slug: string) {
    return this.success(await this.service.topicDetail(slugValue(slug)));
  }
  @Get('/navigation')
  async navigation() {
    return this.success(await this.service.navigation());
  }
  @Get('/blocks/:position')
  async blocks(@Param('position') position: string) {
    return this.success(await this.service.blocks(slugValue(position)));
  }
  @Get('/comments/:slug')
  async comments(@Param('slug') slug: string, @Query() query: CmsQueryDto) {
    return this.success(await this.service.comments(slugValue(slug), query));
  }
  @Post('/comments/:slug')
  async createComment(@Param('slug') slug: string, @Body() data: CmsPublicCommentDto) {
    if (!this.ctx.userInfo) throw new UnauthorizedError('请登录后再发表评论');
    return this.success(await this.service.createComment(slugValue(slug), data));
  }
  @Post('/comments/:slug/report/:id')
  async reportComment(@Param('slug') slug: string, @Param('id') id: string, @Body() data: { reason: string }) {
    if (!this.ctx.userInfo) throw new UnauthorizedError('请登录后再举报评论');
    return this.success(await this.service.reportComment(slugValue(slug), id, data));
  }
  @Post('/orders/:slug')
  async createOrder(@Param('slug') slug: string, @Body() data: CmsOrderCreateDto) {
    return this.success(await this.orderService.create(slugValue(slug), data));
  }
  @Get('/orders/query')
  async queryOrder(@Query() query: CmsOrderQueryDto) {
    return this.success(await this.orderService.query(query));
  }
}
