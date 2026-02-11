import { ApiOperationResponse, IndexPermission } from '@/decorators/index.js';
import { uploadStorage } from '@/fileManage/index.js';
import { UploadMiddleware, UploadOptions, UploadStreamFileInfo } from '@midwayjs/busboy';
import { Body, Config, Controller, Fields, Files, Get, Inject, Param, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiBody, BodyContentType } from '@midwayjs/swagger';
import { File } from '../../../entities/file.entity.js';
import { FileQueryDto } from '../dto/fileQuery.dto.js';
import { FileUpDto } from '../dto/fileUp.dto.js';
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
    return await uploadStorage.localStorage('index').getFileReadSteam(entity.path);
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
    const res = await uploadStorage.localStorage('index').upload(file, params);
    return this.success(res ? await this.fileService.create(res) : {});
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/my')
  @ApiOperationResponse({
    responsePage: File,
    summary: '获取我的附件列表',
  })
  @IndexPermission()
  async my(@Body() queryDto: FileQueryDto) {
    queryDto.createdUserId = this.ctx.userInfo.id;
    return this.success(await this.fileService.list(queryDto));
  }
}
