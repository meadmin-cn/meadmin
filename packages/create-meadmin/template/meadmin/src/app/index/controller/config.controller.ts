import { Controller, Get, Inject, Param, Query } from '@midwayjs/core';
import { ConfigService } from '../service/config.service.js';
import { BaseController } from './base.controller.js';

/**
 * 提供前台和其他公共场景读取启用配置、字典的接口，不附加后台权限校验。
 */
@Controller('config')
export class ConfigController extends BaseController {
  @Inject()
  configService: ConfigService;

  @Get('/value/:groupCode')
  async getValues(@Param('groupCode') groupCode: string, @Query('path') path?: string) {
    const values = await this.configService.getValues(groupCode);
    if (!path) return this.success(values);
    const data = this.configService.valuesToValue(values, path);
    return { ...this.success(), data: data ?? null };
  }

  @Get('/dict/:code')
  async getDict(@Param('code') code: string) {
    return this.success(await this.configService.getDict(code));
  }
}
