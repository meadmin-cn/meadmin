import { ApiOperationResponse, IndexPermission } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { User } from '../../../entities/user.entity.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';
import { UserService } from '../service/user.service.js';
import { BaseController } from './base.controller.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('user')
export class UserController extends BaseController {
  @Inject()
  userService: UserService;

  @Inject()
  ctx: Context;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info')
  @ApiOperationResponse({
    responseType: User,
    summary: '获取当前用户的信息',
  })
  @IndexPermission()
  async info() {
    const entity = await this.userService.findOne(this.ctx.userInfo!.id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up')
  @ApiOperationResponse({
    responseType: User,
    summary: '更新当前用户信息',
  })
  @IndexPermission()
  async update(@Body() updateDto: UserUpdateDto) {
    return this.success(await this.userService.update(this.ctx.userInfo!.id, updateDto));
  }
}
