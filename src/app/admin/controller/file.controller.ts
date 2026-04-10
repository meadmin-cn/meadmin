import { ApiOperationResponse } from '@/decorators/index.js';
import { uploadStorage } from '@/fileManage/index.js';
import { UploadOptions, UploadStreamFileInfo } from '@midwayjs/busboy';
import { UploadMiddleware } from '@midwayjs/busboy';
import { Body, Config, Controller, Fields, Files, Get, Inject, Param, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiBody, BodyContentType } from '@midwayjs/swagger';
import { File } from '../../../entities/file.entity.js';
import { FileQueryDto } from '../dto/fileQuery.dto.js';
import { FileUpDto } from '../dto/fileUp.dto.js';
import { FileUpdateDto } from '../dto/fileUpdate.dto.js';
import { FileService } from '../service/file.service.js';
import { BaseController } from './base.controller.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('file')
export class FileController extends BaseController {
  @Inject()
  fileService: FileService;

  @Config('busboy')
  fileUpconfig: Partial<UploadOptions>;

  @Inject()
  ctx: Context;

  @Get('/get/:id/:name', { summary: '获取文件流' })
  async getFile(@Param('id') id: string) {
    const entity = await this.fileService.findOne(id);
    this.ctx.type = entity.mimeType;
    return await uploadStorage.localStorage('admin').getFileReadSteam(entity.path);
  }

  @Post('/upload', { middleware: [UploadMiddleware] })
  @ApiBody({
    contentType: BodyContentType.Multipart,
    schema: {
      type: FileUpDto,
    },
  })
  @ApiOperationResponse({
    responseType: File,
    summary: '上传附件',
    description: '如果data为{}代表分片上传成功，为Fule对象代表文件上传完成(可能已存在秒传成功)',
  })
  async upload(@Files() files: Array<UploadStreamFileInfo>, @Fields() params: FileUpDto) {
    const file = files[0]; //只获取一个文件，不支持多文件数组
    const res = await uploadStorage.localStorage('admin').upload(file, params);
    return this.success(res ? await this.fileService.create(res) : {});
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: File,
    summary: '获取附件列表',
  })
  async list(@Body() queryDto: FileQueryDto) {
    return this.success(await this.fileService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/my')
  @ApiOperationResponse({
    responsePage: File,
    summary: '获取我的附件列表',
  })
  async my(@Body() queryDto: FileQueryDto) {
    queryDto.createdAdminId = this.ctx.adminInfo?.id;
    return this.success(await this.fileService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: File,
    summary: '根据id获取附件详情',
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.fileService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up/:id')
  @ApiOperationResponse({
    responseType: File,
    summary: '根据id更新附件详情',
  })
  async update(@Param('id') id: string, @Body() updateDto: FileUpdateDto) {
    return this.success(await this.fileService.update(id, updateDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除附件信息',
  })
  async delete(@Param('id') id: string) {
    await this.fileService.remove(id);
    return this.success();
  }
}
