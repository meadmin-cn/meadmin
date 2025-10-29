import { Body, Controller, Get, Post, Inject, Param } from '@midwayjs/core';
import { BaseController } from '../base.controller.js';
import { SystemRole } from '../../../../entities/systemRole.entity.js';
import { SystemRoleCreateDto } from '../../dto/system/roleCreate.dto.js';
import { SystemRoleQueryDto } from '../../dto/system/roleQuery.dto.js';
import { SystemRoleUpdateDto } from '../../dto/system/roleUpdate.dto.js';
import { SystemRoleService } from '../../service/system/role.service.js';
import { ApiOperationResponse } from '@/decorators/index.js';
import { SystemRoleTreeAllResultDto } from '../../dto/system/roleTreeAllResult.dto.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('system/role')
export class SystemRoleController extends BaseController {
  @Inject()
  systemRoleService: SystemRoleService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: SystemRole,
    summary: '添加角色信息',
  })
  async add(@Body() createDto: SystemRoleCreateDto) {
    createDto.isSuper = 0;
    return this.success(await this.systemRoleService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: SystemRole,
    summary: '获取角色列表',
  })
  async list(@Body() queryDto: SystemRoleQueryDto) {
    return this.success(await this.systemRoleService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头 
  @Get('/treeAll')
  @ApiOperationResponse({
    responseList: SystemRoleTreeAllResultDto,
    summary: '获取所有角色(按父子级返回)',
  })
  async treeAll() {
    return this.success(await this.systemRoleService.treeAll());
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: SystemRole,
    summary: '根据id获取角色详情',
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.systemRoleService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up/:id')
  @ApiOperationResponse({
    responseType: SystemRole,
    summary: '根据id更新角色详情',
  })
  async update(@Param('id') id: string, @Body() updateDto: SystemRoleUpdateDto) {
    return this.success(await this.systemRoleService.update(id, updateDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除角色信息',
  })
  async delete(@Param('id') id: string) {
    await this.systemRoleService.remove(id);
    return this.success();
  }
}
