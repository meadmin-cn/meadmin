import { Body, Controller, Post, Inject, Get, Param } from '@midwayjs/core';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { BaseController } from './base.controller.js';
import { ApiOperation, ApiResponse } from '@midwayjs/swagger';
import { User } from '@/entities/user.entity.js';
import { ApiPageWapper } from '@/response/apiPage.res.js';
import { ApiSuccessWapper, EmptyClass } from '@/response/apiSuccess.res.js';
import { UserQueryDto } from '../dto/userQuery.dto.js';
import { UserService } from '../service/user.service.js';
import { ForbiddenError } from '@/error/forbiddenError.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';

@Controller('user')
export class UserController extends BaseController {
  @Inject()
  userService: UserService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperation({ summary: '添加用户信息' })
  @ApiResponse({
    type: ApiSuccessWapper(User),
  })
  async add(@Body() user: UserCreateDto) {
    return this.responseService.success(await this.userService.create(user));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperation({ summary: '获取用户列表' })
  @ApiResponse({ type: ApiPageWapper(User) })
  async list(@Body() user: UserQueryDto) {
    return this.responseService.success({
      list: await this.userService.findAll(user),
      total: await this.userService.count(user),
    });
  }

  @Get('/:id')
  @ApiOperation({ summary: '根据id获取用户详情' })
  @ApiResponse({
    type: ApiSuccessWapper(User),
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.userService.findOne(id);
    if (entity) {
      return this.responseService.success(entity);
    }
    throw new ForbiddenError('没用对应的信息');
  }

  @Post('/:id')
  @ApiOperation({ summary: '根据id更新用户详情' })
  @ApiResponse({
    type: ApiSuccessWapper(User),
  })
  async update(@Param('id') id: string, @Body() updateDto: UserUpdateDto) {
    return this.responseService.success(
      await this.userService.update(id, updateDto)
    );
  }

  @Get('/del/:id')
  @ApiOperation({ summary: '根据id删除用户信息' })
  @ApiResponse({ type: ApiSuccessWapper(EmptyClass) })
  async del(@Param('id') id: string) {
    await this.userService.remove(id);
    return this.responseService.success();
  }
}
