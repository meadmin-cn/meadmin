import { ApiOperationResponse } from '@/decorators/index.js';
import { AonDocConfig } from '@/entities/aonDocConfig.entity.js';
import { Controller, Get, Inject, Param, Query } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { AonDocContentResultDto } from '../dto/aonDocContentResult.dto.js';
import { AonDocMenutreeResultDto } from '../dto/aonDocMenutreeResult.dto.js';
import { AonDocService } from '../service/aonDoc.service.js';
import { AonDocConfigService } from '../service/config.service.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，方便传参，除详情外统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('aonDoc')
export class AonDocController extends BaseController {
  @Inject()
  aonDocService: AonDocService;

  @Inject()
  configService: AonDocConfigService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/menuTree')
  @ApiOperationResponse({
    responseList: AonDocMenutreeResultDto,
    summary: '获取所有菜单(按父子级返回)',
  })
  async menuTree(@Query('version') version?: string) {
    let v = '';
    if (version) {
      v = version;
    } else {
      const config = await this.configService.findOne('1');
      v = config.version.find((item) => item.status === 1).code;
    }
    return this.success(await this.aonDocService.menuTree(v));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/getContent/:id')
  @ApiOperationResponse({
    responseList: AonDocContentResultDto,
    summary: '获取详情',
  })
  async getContent(@Param('id') id: string) {
    return this.success(await this.aonDocService.getContent(id));
  }

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/config')
  @ApiOperationResponse({
    responseType: AonDocConfig,
    summary: '获取配置详情',
  })
  async getConfig() {
    return this.success(await this.configService.findOne('1'));
  }
}
