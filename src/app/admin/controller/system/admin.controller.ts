import { Body, Controller, Post, Inject, Param, Get } from '@midwayjs/core';
import { BaseController } from '../base.controller.js';
import { SystemAdmin } from '../../../../entities/systemAdmin.entity.js';
import { SystemAdminCreateDto } from '../../dto/system/adminCreate.dto.js';
import { SystemAdminQueryDto } from '../../dto/system/adminQuery.dto.js';
import { SystemAdminUpdateDto } from '../../dto/system/adminUpdate.dto.js';
import { SystemAdminService } from '../../service/system/admin.service.js';
import { ApiOperationResponse } from '@/decorators/index.js';
import { AdminPermission } from '@/decorators/index.js';;

/**
 * 为了防止防火墙禁止PUT、DELETE请求，规避get请求缓存，统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('system/admin')
export class SystemAdminController extends BaseController {
  @Inject()
  systemAdminService: SystemAdminService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: SystemAdmin,
    summary: '添加管理员信息',
  })
  @AdminPermission('systemAdminAdd')
  async add(@Body() createDto: SystemAdminCreateDto) {
    return this.success(await this.systemAdminService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: SystemAdmin,
    summary: '获取管理员列表',
  })
  @AdminPermission('systemAdminList')
  async list(@Body() queryDto: SystemAdminQueryDto) {
    return this.success(await this.systemAdminService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: SystemAdmin,
    summary: '根据id获取管理员详情',
  })
  @AdminPermission('systemAdminEdit')
  async findOne(@Param('id') id: string) {
    const entity = await this.systemAdminService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up/:id')
  @ApiOperationResponse({
    responseType: SystemAdmin,
    summary: '根据id更新管理员详情',
  })
  @AdminPermission('systemAdminEdit')
  async update(@Param('id') id: string, @Body() updateDto: SystemAdminUpdateDto) {
    return this.success(await this.systemAdminService.update(id, updateDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除管理员信息',
  })
  @AdminPermission('systemAdminDel')
  async delete(@Param('id') id: string) {
    await this.systemAdminService.remove(id);
    return this.success();
  }
}
