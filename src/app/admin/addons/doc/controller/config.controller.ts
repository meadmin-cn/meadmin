import { AdminPermission, ApiOperationResponse } from '@/decorators/index.js';
import { Body, Controller, Get, Inject, Post } from '@midwayjs/core';
import { AonDocConfig } from '../../../../../entities/aonDocConfig.entity.js';
import { BaseController } from '../../../controller/base.controller.js';
import { AonDocConfigUpdateDto } from '../dto/configUpdate.dto.js';
import { AonDocConfigService } from '../service/config.service.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，方便传参，除详情外统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('addons/doc/config')
export class AonDocConfigController extends BaseController {
  @Inject()
  aonDocConfigService: AonDocConfigService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/info')
  @ApiOperationResponse({
    responseType: AonDocConfig,
    summary: '获取配置详情',
  })
  @AdminPermission('aon_doc_config_info')
  async findOne() {
    const entity = await this.aonDocConfigService.findOne('1');
    return this.success(entity);
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Post('/up')
  @ApiOperationResponse({
    responseType: AonDocConfig,
    summary: '更新配置信息',
  })
  @AdminPermission('aon_doc_config_edit')
  async update(@Body() updateDto: AonDocConfigUpdateDto) {
    return this.success(await this.aonDocConfigService.update('1', updateDto));
  }
}
