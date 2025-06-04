import { Body, Controller, Post, Inject, Get, Param } from '@midwayjs/core';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { BaseController } from './base.controller.js';
import { User } from '@/entities/user.entity.js';
import { UserQueryDto } from '../dto/userQuery.dto.js';
import { UserService } from '../service/user.service.js';
import { ForbiddenError } from '@/error/forbiddenError.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';
import { ApiOperationResponse } from '@/decorators/index.js';

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
  async add(@Body() user: UserCreateDto) {
    return this.responseService.success(await this.userService.create(user));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: User,
    summary: '获取用户列表',
  })
  async list(@Body() user: UserQueryDto) {
    return this.responseService.success({
      list: await this.userService.findAll(user),
      total: await this.userService.count(user),
    });
  }

  @Get('/:id')
  @ApiOperationResponse({
    responseType: User,
    summary: '根据id获取用户详情',
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.userService.findOne(id);
    if (entity) {
      return this.responseService.success(entity);
    }
    throw new ForbiddenError('没用对应的信息');
  }

  @Post('/:id')
  @ApiOperationResponse({
    responseType: User,
    summary: '根据id更新用户详情',
  })
  async update(@Param('id') id: string, @Body() updateDto: UserUpdateDto) {
    return this.responseService.success(
      await this.userService.update(id, updateDto)
    );
  }

  @Get('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除用户信息',
  })
  async del(@Param('id') id: string) {
    await this.userService.remove(id);
    return this.responseService.success();
  }
}
