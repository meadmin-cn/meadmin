import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { SystemSite } from '../../../../entities/systemSite.entity.js';
import { SystemSiteQueryDto, SystemSiteSaveDto, SystemSiteUpdateDto } from '../../dto/system/site.dto.js';
import { SystemSiteService } from '../../service/system/site.service.js';
import { BaseController } from '../base.controller.js';

/**
 * 站点域名绑定管理。为规避防火墙与缓存，与其他后台接口一致统一使用 POST。
 */
@Controller('system/site')
export class SystemSiteController extends BaseController {
  @Inject()
  systemSiteService: SystemSiteService;

  @Post('/add')
  @ApiOperationResponse({ responseType: SystemSite, summary: '添加站点' })
  @AdminPermission('system_site_add')
  async add(@Body() createDto: SystemSiteSaveDto) {
    return this.success(await this.systemSiteService.save(undefined, createDto));
  }

  @Post('/')
  @ApiOperationResponse({ responsePage: SystemSite, summary: '获取站点列表' })
  @AdminPermission('system_site_list')
  async list(@Body() queryDto: SystemSiteQueryDto) {
    return this.success(await this.systemSiteService.list(queryDto));
  }

  @Get('/all')
  @ApiOperationResponse({ responseList: SystemSite, summary: '获取全部站点' })
  @AdminPermission(['system_site_list', 'system_rewrite_list'])
  async all() {
    return this.success(await this.systemSiteService.all());
  }

  @Post('/up/:id')
  @ApiOperationResponse({ responseType: SystemSite, summary: '更新站点' })
  @AdminPermission('system_site_edit')
  async update(@Param('id') id: string, @Body() updateDto: SystemSiteUpdateDto) {
    return this.success(await this.systemSiteService.save(id, updateDto));
  }

  @Post('/del/:id')
  @ApiOperationResponse({ summary: '删除站点及其伪静态规则' })
  @AdminPermission('system_site_del')
  async delete(@Param('id') id: string) {
    await this.systemSiteService.remove(id);
    return this.success();
  }
}
