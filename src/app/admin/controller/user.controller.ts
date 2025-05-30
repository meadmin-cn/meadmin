import { Body, Controller, Get, Post, Query } from '@midwayjs/core';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { BaseController } from './base.controller.js';
import { ApiOperation, ApiResponse } from '@midwayjs/swagger';
import { User } from '@/entities/user.entity.js';
import { ApiPageWapper } from '@/response/apiPage.res.js';
import { ApiSuccessWapper } from '@/response/apiSuccess.res.js';
import { UserQueryDto } from '../dto/userQuery.dto.js';

@Controller('user')
export class UserController extends BaseController {
  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperation({ summary: '添加用户信息' })
  @ApiResponse({
    type: ApiSuccessWapper(User),
  })
  async add(@Body() user: UserCreateDto) {
    return this.resposes.success(user);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ type: ApiPageWapper(User) })
  async list(@Query() user: UserQueryDto) {
    return this.resposes.success(user);
  }
}
