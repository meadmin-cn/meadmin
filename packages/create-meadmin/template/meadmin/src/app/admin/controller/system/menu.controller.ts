import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { SystemMenu } from '../../../../entities/systemMenu.entity.js';
import { SystemMenuCreateDto } from '../../dto/system/menuCreate.dto.js';
import { SystemMenuQueryDto } from '../../dto/system/menuQuery.dto.js';
import { SystemMenuTreeAllResultDto } from '../../dto/system/menuTreeAllResult.dto.js';
import { SystemMenuUpdateDto } from '../../dto/system/menuUpdate.dto.js';
import { SystemMenuService } from '../../service/system/menu.service.js';
import { BaseController } from '../base.controller.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('system/menu')
export class SystemMenuController extends BaseController {
  @Inject()
  systemMenuService: SystemMenuService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: SystemMenu,
    summary: '添加菜单信息',
  })
  @AdminPermission('system_role_add')
  async add(@Body() createDto: SystemMenuCreateDto) {
    return this.success(await this.systemMenuService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: SystemMenu,
    summary: '获取菜单列表',
  })
  @AdminPermission('system_menu_role')
  async list(@Body() queryDto: SystemMenuQueryDto) {
    return this.success(await this.systemMenuService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/treeAll')
  @ApiOperationResponse({
    responseList: SystemMenuTreeAllResultDto,
    summary: '获取所有菜单(按父子级返回)',
  })
  @AdminPermission('system_menu_role')
  async treeAll() {
    return this.success(await this.systemMenuService.treeAll());
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: SystemMenu,
    summary: '根据id获取菜单详情',
  })
  @AdminPermission('system_role_info')
  async findOne(@Param('id') id: string) {
    const entity = await this.systemMenuService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up/:id')
  @ApiOperationResponse({
    responseType: SystemMenu,
    summary: '根据id更新菜单信息',
  })
  @AdminPermission('system_menu_edit')
  async update(@Param('id') id: string, @Body() updateDto: SystemMenuUpdateDto) {
    return this.success(await this.systemMenuService.update(id, updateDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除菜单信息',
  })
  @AdminPermission('system_menu_del')
  async delete(@Param('id') id: string) {
    await this.systemMenuService.remove(id);
    return this.success();
  }
}
