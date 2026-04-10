import { CodeEunm } from '@/dict/code.enum.js';
import { ResponseService } from '@/service/response.service.js';
import { Context, ILogger } from '@midwayjs/core';
import { Catch, Config, Logger } from '@midwayjs/core';
import { MidwayI18nService } from '@midwayjs/i18n';
import { ValidationError } from '@sequelize/core';

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

  async catch(err: Error | ValidationError, ctx: Context) {
    this.logger.error(err, ctx);
    // 所有的未分类错误会到这里
    const i18n = await ctx.requestContext.getAsync(MidwayI18nService);
    return this.resposes.error(this.debug ? err.message + ((err as ValidationError).errors ? '; ' + (err as ValidationError).errors.join('、') : '') : i18n.translate('未知异常请联系管理员'), CodeEunm.Error);
  }
}
