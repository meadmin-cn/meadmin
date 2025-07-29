import { Inject, Controller } from '@midwayjs/core';
import { ResponseService } from '@/service/response.service.js';
import { CodeEunm } from '@/dict/code.enum.js';

@Controller('/api')
export abstract class ApiController {
  @Inject()
  protected readonly responseService: ResponseService;

  success<T extends Record<string, any>>(data: T = {} as T, message = '操作成功') {
    return this.responseService.success(data, message);
  }

  error(message: string, code: Exclude<CodeEunm, CodeEunm.Success> = CodeEunm.Fail) {
    return this.responseService.error(message, code);
  }

  successPage<T = any>(list: T[], total = 0, page = 1, size = 10, message = '列表数据获取成功') {
    return this.responseService.successPage(list, total, page, size, message);
  }
}
