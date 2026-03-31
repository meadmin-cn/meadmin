import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post, Query } from '@midwayjs/core';
import { AonDoc } from '../../../../../entities/aonDoc.entity.js';
import { BaseController } from '../../../controller/base.controller.js';
import { AonDocCreateDto } from '../dto/docCreate.dto.js';
import { AonDocQueryDto } from '../dto/docQuery.dto.js';
import { AonDocTreeAllResultDto } from '../dto/docTreeAllResult.dto.js';
import { AonDocUpdateDto } from '../dto/docUpdate.dto.js';
import { AonDocService } from '../service/doc.service.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，方便传参，除详情外统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('addons/doc/doc')
export class AonDocController extends BaseController {
  @Inject()
  aonDocService: AonDocService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/treeAll')
  @ApiOperationResponse({
    responseList: AonDocTreeAllResultDto,
    summary: '获取所有文档(按父子级返回)',
  })
  @AdminPermission(['aon_doc_list', 'aon_doc_add', 'aon_doc_edit', 'aon_doc_info'])
  async treeAll(@Query('version') version?: string) {
    return this.success(await this.aonDocService.treeAll(version));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: AonDoc,
    summary: '添加文档信息',
  })
  @AdminPermission('aon_doc_add')
  async add(@Body() createDto: AonDocCreateDto) {
    return this.success(await this.aonDocService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: AonDoc,
    summary: '获取文档列表',
  })
  @AdminPermission('aon_doc_list')
  async list(@Body() queryDto: AonDocQueryDto) {
    return this.success(await this.aonDocService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: AonDoc,
    summary: '根据id获取文档详情',
  })
  @AdminPermission('aon_doc_info')
  async findOne(@Param('id') id: string) {
    const entity = await this.aonDocService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up/:id')
  @ApiOperationResponse({
    responseType: AonDoc,
    summary: '根据id更新文档信息',
  })
  @AdminPermission('aon_doc_edit')
  async update(@Param('id') id: string, @Body() updateDto: AonDocUpdateDto) {
    return this.success(await this.aonDocService.update(id, updateDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除文档信息',
  })
  @AdminPermission('aon_doc_del')
  async delete(@Param('id') id: string) {
    await this.aonDocService.remove(id);
    return this.success();
  }
}
