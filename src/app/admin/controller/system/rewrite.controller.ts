import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Inject, Param, Post } from '@midwayjs/core';
import { SystemRewrite } from '../../../../entities/systemRewrite.entity.js';
import { SystemRewriteCompileDto, SystemRewriteQueryDto, SystemRewriteSaveDto, SystemRewriteUpdateDto } from '../../dto/system/rewrite.dto.js';
import { SystemRewriteService } from '../../service/system/rewrite.service.js';
import { BaseController } from '../base.controller.js';

/**
 * 站点伪静态规则管理。
 */
@Controller('system/rewrite')
export class SystemRewriteController extends BaseController {
  @Inject()
  systemRewriteService: SystemRewriteService;

  @Post('/add')
  @ApiOperationResponse({ responseType: SystemRewrite, summary: '添加伪静态规则' })
  @AdminPermission('system_rewrite_add')
  async add(@Body() createDto: SystemRewriteSaveDto) {
    return this.success(await this.systemRewriteService.save(undefined, createDto));
  }

  @Post('/')
  @ApiOperationResponse({ responsePage: SystemRewrite, summary: '获取伪静态规则列表' })
  @AdminPermission('system_rewrite_list')
  async list(@Body() queryDto: SystemRewriteQueryDto) {
    return this.success(await this.systemRewriteService.list(queryDto));
  }

  @Post('/up/:id')
  @ApiOperationResponse({ responseType: SystemRewrite, summary: '更新伪静态规则' })
  @AdminPermission('system_rewrite_edit')
  async update(@Param('id') id: string, @Body() updateDto: SystemRewriteUpdateDto) {
    return this.success(await this.systemRewriteService.save(id, updateDto));
  }

  @Post('/del/:id')
  @ApiOperationResponse({ summary: '删除伪静态规则' })
  @AdminPermission('system_rewrite_del')
  async delete(@Param('id') id: string) {
    await this.systemRewriteService.remove(id);
    return this.success();
  }

  @Post('/compile')
  @ApiOperationResponse({ summary: '编译预览 URL 模式（nginx 语法）' })
  @AdminPermission(['system_rewrite_add', 'system_rewrite_edit'])
  async compile(@Body() compileDto: SystemRewriteCompileDto) {
    return this.success(this.systemRewriteService.compile(compileDto.pattern, compileDto.target));
  }
}
