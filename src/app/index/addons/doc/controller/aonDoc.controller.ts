import { ApiOperationResponse } from '@/decorators/index.js';
import { Controller, Get, Inject, Param } from '@midwayjs/core';
import { BaseController } from '../../../controller/base.controller.js';
import { AonDocContentResultDto } from '../dto/aonDocContentResult.dto copy.js';
import { AonDocMenutreeResultDto } from '../dto/aonDocMenutreeResult.dto.js';
import { AonDocService } from '../service/aonDoc.service.js';

/**
 * 为了防止防火墙禁止PUT、DELETE请求，方便传参，除详情外统一使用post请求。
 * meadmin对controller做了装饰器继承封装，当以/开头时会使用当前controller前缀地址，不以/开头时会递归继承controller前缀地址
 */
@Controller('aonDoc')
export class AonDocController extends BaseController {
  @Inject()
  aonDocService: AonDocService;

  //接口方法必须加async 方法的接口装饰器值必须/开头
  @Get('/menuTree')
  @ApiOperationResponse({
    responseList: AonDocMenutreeResultDto,
    summary: '获取所有菜单(按父子级返回)',
  })
  async menuTree() {
    return this.success(await this.aonDocService.menuTree());
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
}
