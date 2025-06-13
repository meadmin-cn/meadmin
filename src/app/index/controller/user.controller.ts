import { Body, Controller, Post, Inject, Param } from '@midwayjs/core';
import { BaseController } from './base.controller.js';
import { User } from '../../../entities/user.entity.js';
import { UserCreateDto } from '../dto/userCreate.dto.js';
import { UserQueryDto } from '../dto/userQuery.dto.js';
import { UserUpdateDto } from '../dto/userUpdate.dto.js';
import { UserService } from '../service/user.service.js';
import { ApiOperationResponse } from '@/decorators/index.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';

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
  async add(@Body() createDto: UserCreateDto) {
    return this.responseService.success(await this.userService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: User,
    summary: '获取用户列表',
  })
  async list(@Body() queryDto: UserQueryDto) {
    return this.responseService.success({
      list: await this.userService.findAll(queryDto),
      total: await this.userService.count(queryDto),
    });
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/update/:id')
  @ApiOperationResponse({
    responseType: User,
    summary: '根据id获取用户详情',
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.userService.findOne(id);
    if (entity) {
      return this.responseService.success(entity);
    }
    throw new BadRequestError('没有对应的信息');
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/info/:id')
  @ApiOperationResponse({
    responseType: User,
    summary: '根据id更新用户详情',
  })
  async update(@Param('id') id: string, @Body() updateDto: UserUpdateDto) {
    return this.responseService.success(
      await this.userService.update(id, updateDto)
    );
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除用户信息',
  })
  async del(@Param('id') id: string) {
    await this.userService.remove(id);
    return this.responseService.success();
  }
}
