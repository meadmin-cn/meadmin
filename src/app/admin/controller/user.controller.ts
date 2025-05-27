import { Body, Controller, Get, Post } from '@midwayjs/core';
import { UserAddDto } from '../dto/userAdd.dto.js';
import { BaseController } from './base.controller.js';
import { ApiOperation, ApiResponse } from '@midwayjs/swagger';
import { User } from '@/app/entity/user.js';
import { ApiPageWapper } from '@/response/apiPage.res.js';
import { ApiSuccessWapper } from '@/response/apiSuccess.res.js';

@Controller('user')
export class UserController extends BaseController {
  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperation({ summary: '添加用户信息' })
  @ApiResponse({
    type: ApiSuccessWapper(User),
  })
  async add(@Body() user: UserAddDto) {
    return this.resposes.success(user);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ type: ApiPageWapper(User) })
  async list(@Body() user: UserAddDto) {
    return this.resposes.success(user);
  }
}
