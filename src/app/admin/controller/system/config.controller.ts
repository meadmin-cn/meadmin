import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Param, Post } from '@midwayjs/core';
import { SystemConfig } from '../../../../entities/systemConfig.entity.js';
import { SystemConfigGroup } from '../../../../entities/systemConfigGroup.entity.js';
import { SystemConfigCreateDto } from '../../dto/system/configCreate.dto.js';
import { SystemConfigGroupCreateDto } from '../../dto/system/configGroupCreate.dto.js';
import { SystemConfigGroupQueryDto } from '../../dto/system/configGroupQuery.dto.js';
import { SystemConfigGroupSortDto } from '../../dto/system/configGroupSort.dto.js';
import { SystemConfigGroupUpdateDto } from '../../dto/system/configGroupUpdate.dto.js';
import { SystemConfigQueryDto } from '../../dto/system/configQuery.dto.js';
import { SystemConfigUpdateDto } from '../../dto/system/configUpdate.dto.js';
import { SystemConfigValueSaveDto } from '../../dto/system/configValue.dto.js';
import { SystemConfigService } from '../../service/system/config.service.js';
import { BaseController } from '../base.controller.js';

@Controller('system/config')
export class SystemConfigController extends BaseController {
  @Inject()
  systemConfigService: SystemConfigService;

  @Post('/group')
  @ApiOperationResponse({ responsePage: SystemConfigGroup, summary: '获取配置分组列表' })
  @AdminPermission(['system_config_list', 'system_config_group_list'])
  async listGroups(@Body() queryDto: SystemConfigGroupQueryDto) {
    return this.success(await this.systemConfigService.listGroups(queryDto));
  }

  @Get('/group/:id')
  @ApiOperationResponse({ responseType: SystemConfigGroup, summary: '获取配置分组详情' })
  @AdminPermission('system_config_info')
  async findGroup(@Param('id') id: string) {
    return this.success(await this.systemConfigService.findGroup(id));
  }

  @Post('/group/add')
  @ApiOperationResponse({ responseType: SystemConfigGroup, summary: '新增配置分组' })
  @AdminPermission('system_config_group_add')
  async addGroup(@Body() createDto: SystemConfigGroupCreateDto) {
    return this.success(await this.systemConfigService.createGroup(createDto));
  }

  @Post('/group/up/:id')
  @ApiOperationResponse({ responseType: SystemConfigGroup, summary: '更新配置分组' })
  @AdminPermission('system_config_group_edit')
  async updateGroup(@Param('id') id: string, @Body() updateDto: SystemConfigGroupUpdateDto) {
    return this.success(await this.systemConfigService.updateGroup(id, updateDto));
  }

  @Post('/group/sort')
  @ApiOperationResponse({ responseType: SystemConfigGroup, summary: '调整自定义配置组顺序' })
  @AdminPermission('system_config_group_edit')
  async sortGroups(@Body() sortDto: SystemConfigGroupSortDto) {
    return this.success(await this.systemConfigService.sortGroups(sortDto));
  }

  @Post('/group/del/:id')
  @ApiOperationResponse({ summary: '删除配置分组' })
  @AdminPermission('system_config_group_del')
  async deleteGroup(@Param('id') id: string) {
    await this.systemConfigService.removeGroup(id);
    return this.success();
  }

  @Post('/')
  @ApiOperationResponse({ responsePage: SystemConfig, summary: '获取配置项列表' })
  @AdminPermission(['system_config_list', 'system_config_group_list'])
  async listConfigs(@Body() queryDto: SystemConfigQueryDto) {
    return this.success(await this.systemConfigService.listConfigs(queryDto));
  }

  @Get('/info/:id')
  @ApiOperationResponse({ responseType: SystemConfig, summary: '获取配置项详情' })
  @AdminPermission(['system_config_info', 'system_config_group_list'])
  async findConfig(@Param('id') id: string) {
    return this.success(await this.systemConfigService.findConfig(id));
  }

  @Post('/add')
  @ApiOperationResponse({ responseType: SystemConfig, summary: '新增配置字段' })
  @AdminPermission('system_config_field_add')
  async addConfig(@Body() createDto: SystemConfigCreateDto) {
    return this.success(await this.systemConfigService.createConfig(createDto));
  }

  @Post('/up/:id')
  @ApiOperationResponse({ responseType: SystemConfig, summary: '更新配置字段' })
  @AdminPermission('system_config_field_edit')
  async updateConfig(@Param('id') id: string, @Body() updateDto: SystemConfigUpdateDto) {
    return this.success(await this.systemConfigService.updateConfig(id, updateDto));
  }

  @Post('/del/:id')
  @ApiOperationResponse({ summary: '删除配置字段' })
  @AdminPermission('system_config_field_del')
  async deleteConfig(@Param('id') id: string) {
    await this.systemConfigService.removeConfig(id);
    return this.success();
  }

  // 字典配置独立接口：与配置字段复用同一套 service，但使用字典专属权限，便于在角色权限中分别授权。
  @Post('/dict/add')
  @ApiOperationResponse({ responseType: SystemConfig, summary: '新增字典' })
  @AdminPermission('system_config_dict_add')
  async addDictConfig(@Body() createDto: SystemConfigCreateDto) {
    return this.success(await this.systemConfigService.createConfig(createDto));
  }

  @Post('/dict/up/:id')
  @ApiOperationResponse({ responseType: SystemConfig, summary: '更新字典' })
  @AdminPermission('system_config_dict_edit')
  async updateDictConfig(@Param('id') id: string, @Body() updateDto: SystemConfigUpdateDto) {
    return this.success(await this.systemConfigService.updateConfig(id, updateDto));
  }

  @Post('/dict/del/:id')
  @ApiOperationResponse({ summary: '删除字典' })
  @AdminPermission('system_config_dict_del')
  async deleteDictConfig(@Param('id') id: string) {
    await this.systemConfigService.removeConfig(id);
    return this.success();
  }

  @Post('/dict/list')
  @ApiOperationResponse({ responsePage: SystemConfig, summary: '分页获取字典项' })
  // 字典列表同时服务配置页签与字典管理，持有任一权限即可访问。
  @AdminPermission(['system_config_list', 'system_config_dict_list'])
  async listDictConfigs(@Body() queryDto: SystemConfigQueryDto) {
    return this.success(await this.systemConfigService.listDictConfigs(queryDto));
  }

  @Get('/value/:groupCode')
  @ApiOperationResponse({ summary: '获取启用配置值' })
  @AdminPermission('system_config_list')
  async getValues(@Param('groupCode') groupCode: string) {
    return this.success(await this.systemConfigService.getValues(groupCode));
  }

  @Post('/value/:groupCode')
  @ApiOperationResponse({ summary: '批量保存配置值' })
  @AdminPermission('system_config_value_edit')
  async saveValues(@Param('groupCode') groupCode: string, @Body() saveDto: SystemConfigValueSaveDto) {
    return this.success(await this.systemConfigService.saveValues(groupCode, saveDto));
  }

  @Get('/dict/:code')
  @ApiOperationResponse({ summary: '查询启用字典选项' })
  @AdminPermission('system_config_list')
  async getDict(@Param('code') code: string) {
    return this.success(await this.systemConfigService.getDict(code));
  }
}
