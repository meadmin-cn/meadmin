import { Body, Controller, Get, Post, Inject, Param } from '@midwayjs/core';
import { BaseController } from './base.controller.js';
import { User } from '../../../entities/user.entity.js';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';
import { UserService } from '../service/user.service.js';
import { ApiOperationResponse } from '@/decorators/index.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('user')
export class UserController extends BaseController {
  @Inject()
  userService: UserService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: User,
    summary: '添加用户信息',
  })
  async register(@Body() createDto: UserCreateDto) {
    return this.success(await this.userService.create(createDto));
  }


  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: User,
    summary: '根据id获取用户详情',
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.userService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up/:id')
  @ApiOperationResponse({
    responseType: User,
    summary: '根据id更新用户详情',
  })
  async update(@Param('id') id: string, @Body() updateDto: UserUpdateDto) {
    return this.success(await this.userService.update(id, updateDto));
  }


}
