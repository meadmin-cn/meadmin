import { AdminPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { AonCmsBlockSaveDto } from '../dto/block.dto.js';
import { CmsQueryDto } from '../dto/common.dto.js';
import { AonCmsBlockService } from '../service/block.service.js';
import { CmsPermissionMiddleware } from './permission.middleware.js';

@Controller('addons/cms/block', { middleware: [CmsPermissionMiddleware] })
export class AonCmsBlockController extends BaseController {
  @Inject() service: AonCmsBlockService;
  @Post('/')
  @AdminPermission('aon_cms_block_list')
  async list(@Body() query: CmsQueryDto) {
    return this.success(await this.service.list(query));
  }
  @Get('/info/:id')
  @AdminPermission(['aon_cms_block_info', 'aon_cms_block_edit'])
  async info(@Param('id') id: string) {
    return this.success(await this.service.info(id));
  }
  @Post('/add')
  @AdminPermission('aon_cms_block_add')
  async add(@Body() data: AonCmsBlockSaveDto) {
    return this.success(await this.service.save(undefined, data));
  }
  @Post('/up/:id')
  @AdminPermission('aon_cms_block_edit')
  async update(@Param('id') id: string, @Body() data: AonCmsBlockSaveDto) {
    return this.success(await this.service.save(id, data));
  }
  @Post('/del/:id')
  @AdminPermission('aon_cms_block_del')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return this.success();
  }
}
