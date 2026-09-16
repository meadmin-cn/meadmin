import { Controller, Get, Inject, Param, Query } from '@midwayjs/core';
import { SystemConfigService } from '../../admin/service/system/config.service.js';
import { BaseController } from './base.controller.js';

/**
 * 提供前台和其他公共场景读取启用配置、字典的接口，不附加后台权限校验。
 */
@Controller('config')
export class ConfigController extends BaseController {
  @Inject()
  systemConfigService: SystemConfigService;

  @Get('/value/:groupCode')
  async getValues(@Param('groupCode') groupCode: string, @Query('path') path?: string) {
    const values = await this.systemConfigService.getValues(groupCode);
    if (!path) return this.success(values);
    const result = values.reduce<Record<string, unknown>>((target, item) => {
      target[String(item.variableCode)] = item.value;
      return target;
    }, {});
    const data = path
      .split('.')
      .filter(Boolean)
      .reduce<unknown>((value, key) => (value && typeof value === 'object' && Object.hasOwn(value, key) ? (value as Record<string, unknown>)[key] : undefined), result);
    return { ...this.success(), data: data ?? null };
  }

  @Get('/dict/:code')
  async getDict(@Param('code') code: string) {
    return this.success(await this.systemConfigService.getDict(code));
  }
}
