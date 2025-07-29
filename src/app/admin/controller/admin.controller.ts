import { Body, Controller, Post, Inject, Get, Param } from '@midwayjs/core';
import { AdminCreateDto } from '../dto/adminCreate.dto.js';
import { BaseController } from './base.controller.js';
import { Admin } from '@/entities/admin.entity.js';
import { AdminQueryDto } from '../dto/adminQuery.dto.js';
import { AdminService } from '../service/admin.service.js';
import { AdminUpdateDto } from '../dto/adminUpdate.dto.js';
import { ApiOperationResponse } from '@/decorators/index.js';
import { BadRequestError } from '@midwayjs/core/dist/error/http.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('admin')
export class AdminController extends BaseController {
  @Inject()
  adminService: AdminService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: Admin,
    summary: '添加管理员信息',
  })
  async add(@Body() admin: AdminCreateDto) {
    return this.success(await this.adminService.create(admin));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: Admin,
    summary: '获取管理员列表',
  })
  async list(@Body() admin: AdminQueryDto) {
    return this.success({
      list: await this.adminService.findAll(admin),
      total: await this.adminService.count(admin),
    });
  }

  @Get('/:id')
  @ApiOperationResponse({
    responseType: Admin,
    summary: '根据id获取管理员详情',
  })
  async findOne(@Param('id') id: string) {
    const entity = await this.adminService.findOne(id);
    if (entity) {
      return this.success(entity);
    }
    throw new BadRequestError('没有对应的信息');
  }

  @Post('/:id')
  @ApiOperationResponse({
    responseType: Admin,
    summary: '根据id更新管理员详情',
  })
  async update(@Param('id') id: string, @Body() updateDto: AdminUpdateDto) {
    return this.success(await this.adminService.update(id, updateDto));
  }

  @Get('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除管理员信息',
  })
  async del(@Param('id') id: string) {
    await this.adminService.remove(id);
    return this.success();
  }
}
