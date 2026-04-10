import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { uploadStorage } from '@/fileManage/index.js';
import { UploadStreamFileInfo } from '@midwayjs/busboy';
import { UploadMiddleware } from '@midwayjs/busboy';
import { Body, Controller, Fields, Files, Get, Inject, Param, Post } from '@midwayjs/core';
import { ApiBody, BodyContentType } from '@midwayjs/swagger';
import { UserFile } from '../../../entities/userFile.entity.js';
import { UserFileQueryDto } from '../dto/userFileQuery.dto.js';
import { UserFileUpDto } from '../dto/userFileUp.dto.js';
import { UserFileUpdateDto } from '../dto/userFileUpdate.dto.js';
import { UserFileService } from '../service/userFile.service.js';
import { BaseController } from './base.controller.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，方便传参，除详情外统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('userFile')
export class UserFileController extends BaseController {
  @Inject()
  userFileService: UserFileService;

  @Post('/upload', { middleware: [UploadMiddleware] })
  @ApiBody({
    contentType: BodyContentType.Multipart,
    schema: {
      type: UserFileUpDto,
    },
  })
  @ApiOperationResponse({
    responseType: File,
    summary: '上传附件',
    description: '如果data为{}代表分片上传成功，为Fule对象代表文件上传完成(可能已存在秒传成功)',
  })
  async upload(@Files() files: Array<UploadStreamFileInfo>, @Fields() params: UserFileUpDto) {
    const file = files[0]; //只获取一个文件，不支持多文件数组
    const res = await uploadStorage.localStorage('index').upload(file, params);
    return this.success(res ? await this.userFileService.create(res) : {});
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: UserFile,
    summary: '获取用户附件表(前台)列表',
  })
  @AdminPermission('user_file_list')
  async list(@Body() queryDto: UserFileQueryDto) {
    return this.success(await this.userFileService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: UserFile,
    summary: '根据id获取用户附件表(前台)详情',
  })
  @AdminPermission('user_file_info')
  async findOne(@Param('id') id: string) {
    const entity = await this.userFileService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up/:id')
  @ApiOperationResponse({
    responseType: UserFile,
    summary: '根据id更新用户附件表(前台)详情',
  })
  @AdminPermission('user_file_edit')
  async update(@Param('id') id: string, @Body() updateDto: UserFileUpdateDto) {
    return this.success(await this.userFileService.update(id, updateDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除用户附件表(前台)信息',
  })
  @AdminPermission('user_file_del')
  async delete(@Param('id') id: string) {
    await this.userFileService.remove(id);
    return this.success();
  }
}
