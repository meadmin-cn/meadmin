import { ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Post } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { SystemAdmin } from '../../../entities/systemAdmin.entity.js';
import { AdminProfileUpdateDto } from '../dto/profileUpdate.dto.js';
import { SystemAdminService } from '../service/system/admin.service.js';
import { BaseController } from './base.controller.js';

//当前登录管理员的个人中心
@Controller('profile')
export class AdminProfileController extends BaseController {
  @Inject()
  systemAdminService: SystemAdminService;

  @Inject()
  ctx: Context;

  @Get('/info')
  @ApiOperationResponse({ responseType: SystemAdmin, summary: '获取当前管理员个人资料' })
  async info() {
    return this.success(await this.systemAdminService.findProfile(this.ctx.adminInfo!.id));
  }

  @Post('/up')
  @ApiOperationResponse({ responseType: SystemAdmin, summary: '更新当前管理员个人资料' })
  async update(@Body() updateDto: AdminProfileUpdateDto) {
    return this.success(await this.systemAdminService.updateProfile(this.ctx.adminInfo!.id, updateDto));
  }
}
