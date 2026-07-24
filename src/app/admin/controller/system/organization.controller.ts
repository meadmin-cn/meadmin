import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { SystemOrganization } from '../../../../entities/systemOrganization.entity.js';
import { SystemOrganizationCreateDto } from '../../dto/system/organizationCreate.dto.js';
import { SystemOrganizationQueryDto } from '../../dto/system/organizationQuery.dto.js';
import { SystemOrganizationUpdateDto } from '../../dto/system/organizationUpdate.dto.js';
import { SystemOrganizationService } from '../../service/system/organization.service.js';
import { BaseController } from '../base.controller.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，方便传参，除详情外统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('system/organization')
export class SystemOrganizationController extends BaseController {
  @Inject()
  systemOrganizationService: SystemOrganizationService;

  //查询belongsToMany关联模型admins管理员
  //获取管理员信息
  @Post('/getSystemAdmin')
  @ApiOperationResponse({
    responseType: SystemOrganization,
    summary: '查询管理员信息',
  })
  @AdminPermission('system_organization_list')
  async getSystemAdmin(@Body('id') id: string, @Body('username') username: string, @Body('page') page = 1, @Body('pageSize') pageSize = 10) {
    return this.success(await this.systemOrganizationService.getSystemAdmin(page, pageSize, id, username));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/add')
  @ApiOperationResponse({
    responseType: SystemOrganization,
    summary: '添加组织信息',
  })
  @AdminPermission('system_organization_add')
  async add(@Body() createDto: SystemOrganizationCreateDto) {
    return this.success(await this.systemOrganizationService.create(createDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/')
  @ApiOperationResponse({
    responsePage: SystemOrganization,
    summary: '获取组织列表',
  })
  @AdminPermission('system_organization_list')
  async list(@Body() queryDto: SystemOrganizationQueryDto) {
    return this.success(await this.systemOrganizationService.list(queryDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info/:id')
  @ApiOperationResponse({
    responseType: SystemOrganization,
    summary: '根据id获取组织详情',
  })
  @AdminPermission('system_organization_info')
  async findOne(@Param('id') id: string) {
    const entity = await this.systemOrganizationService.findOne(id);
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up/:id')
  @ApiOperationResponse({
    responseType: SystemOrganization,
    summary: '根据id更新组织信息',
  })
  @AdminPermission('system_organization_edit')
  async update(@Param('id') id: string, @Body() updateDto: SystemOrganizationUpdateDto) {
    return this.success(await this.systemOrganizationService.update(id, updateDto));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/del/:id')
  @ApiOperationResponse({
    summary: '根据id删除组织信息',
  })
  @AdminPermission('system_organization_del')
  async delete(@Param('id') id: string) {
    await this.systemOrganizationService.remove(id);
    return this.success();
  }
}
