import { Controller, Get, Inject, Query } from '@midwayjs/core';
import { UserService } from '@/service/user.service';
import { BaseController } from './base.controller';

@Controller('/user')
export class UserController extends BaseController {
  @Inject()
  userService: UserService;

  @Get('/get_user', { summary: '获取用户信息' })
  async getUser(@Query('uid') uid) {
    const user = await this.userService.getUser({ uid });
    return this.success(user);
  }
}
