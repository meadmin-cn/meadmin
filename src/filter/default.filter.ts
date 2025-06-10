import { CodeEunm } from '@/dict/code.enum.js';
import { ResponseService } from '@/service/response.service.js';
import { Catch, Config, ILogger, Logger } from '@midwayjs/core';

@Catch()
export class DefaultErrorFilter {
  @Config('debug')
  debug?: boolean;
  @Logger()
  logger: ILogger;
  protected resposes: ResponseService;

  constructor() {
    this.resposes = new ResponseService();
  }
 
  async catch(err: Error) {
    this.logger.error(err);
    // 所有的未分类错误会到这里
    return this.resposes.error(
      this.debug ? err.message : '未知异常请联系管理员',
      CodeEunm.Error
    );
  }
}
