import { Body, Controller, Post, Inject, Param } from '@midwayjs/core';
import { BaseController } from './base.controller.js';
import { Role } from '../../../entities/role.entity.js';
import { RoleCreateDto } from '../dto/roleCreate.dto.js';
import { RoleQueryDto } from '../dto/roleQuery.dto.js';
import { RoleUpdateDto } from '../dto/roleUpdate.dto.js';
import { RoleService } from '../service/role.service.js';
import { ApiOperationResponse } from '@/decorators/index.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('role')
export class RoleController extends BaseController {
  @Inject()
  roleService: RoleService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: Role,
    summary: '添加角色信息',
  })
  async add(@Body() createDto: RoleCreateDto) {
    return this.success(await this.roleService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: Role,
    summary: '获取角色列表',
  })
  async list(@Body() queryDto: RoleQueryDto) {
    return this.success(await this.roleService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/update/:id')
  @ApiOperationResponse({
    responseType: Role,
    summary: '根据id获取角色详情',
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.roleService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/info/:id')
  @ApiOperationResponse({
    responseType: Role,
    summary: '根据id更新角色详情',
  })
  async update(@Param('id') id: string, @Body() updateDto: RoleUpdateDto) {
    return this.success(
      await this.roleService.update(id, updateDto)  
    );
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除角色信息',
  })
  async del(@Param('id') id: string) {
    await this.roleService.remove(id);
    return this.success();
  }
}
