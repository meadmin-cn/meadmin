import { Body, Controller, Post, Inject, Param } from '@midwayjs/core';
import { BaseController } from './base.controller.js';
import { Menu } from '../../../entities/menu.entity.js';
import { MenuCreateDto } from '../dto/menuCreate.dto.js';
import { MenuQueryDto } from '../dto/menuQuery.dto.js';
import { MenuUpdateDto } from '../dto/menuUpdate.dto.js';
import { MenuService } from '../service/menu.service.js';
import { ApiOperationResponse } from '@/decorators/index.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('menu')
export class MenuController extends BaseController {
  @Inject()
  menuService: MenuService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: Menu,
    summary: '添加菜单信息',
  })
  async add(@Body() createDto: MenuCreateDto) {
    return this.success(await this.menuService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: Menu,
    summary: '获取菜单列表',
  })
  async list(@Body() queryDto: MenuQueryDto) {
    return this.success(await this.menuService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/update/:id')
  @ApiOperationResponse({
    responseType: Menu,
    summary: '根据id获取菜单详情',
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.menuService.findOne(id);
    if (entity) {
      return this.success(entity);
    }
    throw new BadRequestError('没有对应的信息');
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/info/:id')
  @ApiOperationResponse({
    responseType: Menu,
    summary: '根据id更新菜单详情',
  })
  async update(@Param('id') id: string, @Body() updateDto: MenuUpdateDto) {
    return this.success(
      await this.menuService.update(id, updateDto)
    );
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除菜单信息',
  })
  async del(@Param('id') id: string) {
    await this.menuService.remove(id);
    return this.success();
  }
}
