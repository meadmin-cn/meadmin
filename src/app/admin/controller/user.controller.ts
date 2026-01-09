import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { User } from '@/entities/user.entity.js';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { UserQueryDto } from '../dto/userQuery.dto.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';
import { UserService } from '../service/user.service.js';
import { BaseController } from './base.controller.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，方便传参，除详情外统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('user')
export class UserController extends BaseController {
  @Inject()
  userService: UserService;

  //查询belongsTo关联模型avatar用户附件表(前台)
  //获取用户附件表(前台)信息
  @Post('/getUserFile')
  @ApiOperationResponse({
    responseType: User,
    summary: '查询用户附件表(前台)信息',
  })
  @AdminPermission('UserList')
  async getUserFile(@Body('id') id: string, @Body('name') name: string, @Body('page') page = 1, @Body('pageSize') pageSize = 10) {
    return this.success(await this.userService.getUserFile(page, pageSize, id, name));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: User,
    summary: '添加用户信息',
  })
  @AdminPermission('UserAdd')
  async add(@Body() createDto: UserCreateDto) {
    return this.success(await this.userService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: User,
    summary: '获取用户列表',
  })
  @AdminPermission('UserList')
  async list(@Body() queryDto: UserQueryDto) {
    return this.success(await this.userService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: User,
    summary: '根据id获取用户详情',
  })
  @AdminPermission('UserEdit')
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
  @AdminPermission('UserEdit')
  async update(@Param('id') id: string, @Body() updateDto: UserUpdateDto) {
    return this.success(await this.userService.update(id, updateDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除用户信息',
  })
  @AdminPermission('UserDel')
  async delete(@Param('id') id: string) {
    await this.userService.remove(id);
    return this.success();
  }
}
