import { Body, Controller, Post, Inject, Param } from '@midwayjs/core';
import { BaseController } from './base.controller.js';
import { __Name__ } from '__entityPath__';
import { __CreateDto__ } from '__createDtoPath__';
import { __QueryDto__ } from '__queryDtoPath__';
import { __UpdateDto__ } from '__updateDtoPath__';
import { __Service__ } from '__servicePath__';
import { ApiOperationResponse } from '@/decorators/index.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('__name__')
export class __Controller__ extends BaseController {
  @Inject()
  __service__: __Service__;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: __Name__,
    summary: '添加__tableComment__信息',
  })
  async add(@Body() createDto: __CreateDto__) {
    return this.responseService.success(await this.__service__.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: __Name__,
    summary: '获取__tableComment__列表',
  })
  async list(@Body() queryDto: __QueryDto__) {
    return this.responseService.success({
      list: await this.__service__.findAll(queryDto),
      total: await this.__service__.count(queryDto),
    });
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/update/:__pk__')
  @ApiOperationResponse({
    responseType: __Name__,
    summary: '根据__pk__获取__tableComment__详情',
  })
  async findOne(@Param('__pk__') __pk__: string) {
    const entity = await this.__service__.findOne(__pk__);
    if (entity) {
      return this.responseService.success(entity);
    }
    throw new BadRequestError('没有对应的信息');
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/info/:__pk__')
  @ApiOperationResponse({
    responseType: __Name__,
    summary: '根据__pk__更新__tableComment__详情',
  })
  async update(@Param('__pk__') __pk__: string, @Body() updateDto: __UpdateDto__) {
    return this.responseService.success(
      await this.__service__.update(__pk__, updateDto)
    );
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:__pk__')
  @ApiOperationResponse({
    summary: '根据__pk__删除__tableComment__信息',
  })
  async del(@Param('__pk__') __pk__: string) {
    await this.__service__.remove(__pk__);
    return this.responseService.success();
  }
}
