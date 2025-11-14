import { Body, Controller, Get, Post, Inject, Param, Files, Fields, Config } from '@midwayjs/core';
import { BaseController } from './base.controller.js';
import { File } from '../../../entities/file.entity.js';
import { FileCreateDto } from '../dto/fileCreate.dto.js';
import { FileQueryDto } from '../dto/fileQuery.dto.js';
import { FileUpdateDto } from '../dto/fileUpdate.dto.js';
import { FileService } from '../service/file.service.js';
import { ApiOperationResponse } from '@/decorators/index.js';
import { UploadMiddleware, UploadOptions, UploadStreamFileInfo } from '@midwayjs/busboy';
import { relative, resolve } from 'node:path';
import { ApiBody, BodyContentType } from '@midwayjs/swagger';
import { FileUpDto } from '../dto/fileUp.dto.js';
import { createWriteStream, mkdirSync, renameSync, statSync, appendFileSync, createReadStream, existsSync, rmSync } from 'node:fs';
import { Context } from '@midwayjs/koa';

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
    this.ctx.type= entity.mimeType;
    return createReadStream(resolve(this.fileUpconfig.upDir, entity.path));
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
      const fileParams = { storage: 'local' } as FileCreateDto;
    fileParams.md5 = params.md5;
    //只处理1个文件上传
    const { filename, mimeType } = file;
    if (params.chunk !== '1') {
      //非分片上传
      const res = await this.fileService.saveFie(file, params.md5, this.fileUpconfig.upDir, this.fileUpconfig.tmpdir);
      fileParams.size = res.size;
      fileParams.path = relative(this.fileUpconfig.upDir, res.path);
    } else {
      //分片上传
      const suffix = filename.substring(filename.lastIndexOf('.')); //后缀带着.
      const saveFilePath = resolve(this.fileUpconfig.upDir, params.md5 + suffix);
      const saveStat = statSync(saveFilePath, { throwIfNoEntry: false });
      if (saveStat) {
        //已存在无需上传
        fileParams.size = saveStat.size;
        fileParams.path = relative(this.fileUpconfig.upDir, saveFilePath);
      } else {
        const path = resolve(this.fileUpconfig.tmpdir, params.md5 + '/');
        if (!existsSync(path)) {
          mkdirSync(path);
        }
        const res = await this.fileService.saveFie(file, params.chunkMd5, path, path);
        const tmpFilePath = resolve(this.fileUpconfig.tmpdir, '__tmp__chunk_all__' + process.pid + '__' + params.md5 + suffix); //临时文件带上进程id防止重复
        appendFileSync(tmpFilePath, ''); //追加空串确保文件存在
        await new Promise<void>((resolve, reject) => {
          const fsStream = createWriteStream(tmpFilePath, { flags: 'r+', start: +params.start, autoClose: true });
          fsStream.on('close', () => {
            resolve();
          });
          fsStream.on('error', (e) => {
            reject(e);
          });
          createReadStream(res.path).pipe(fsStream);
        });
        if (params.over !== '1') {
          //未结束直接返回
          return this.success({});
        }
        renameSync(tmpFilePath, saveFilePath);
        rmSync(path, { force: true, recursive: true });
        fileParams.size = statSync(saveFilePath, { throwIfNoEntry: true }).size;
        fileParams.path = relative(this.fileUpconfig.upDir, saveFilePath);
      }
    }
    fileParams.name = params.name || filename;
    fileParams.mimeType = mimeType;
    return this.success((await this.fileService.create(fileParams)));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: File,
    summary: '添加附件信息',
  })
  async add(@Body() createDto: FileCreateDto) {
    return this.success(await this.fileService.create(createDto));
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
    queryDto.createdAdminId = this.ctx.adminInfo.id;
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
