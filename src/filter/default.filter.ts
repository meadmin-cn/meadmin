import { CodeEunm } from '@/dict/code.enum.js';
import { I18nService } from '@/service/i18n.service.js';
import { ResponseService } from '@/service/response.service.js';
import { Catch, Config, Context, ILogger, Logger } from '@midwayjs/core';
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
    const i18n = await ctx.requestContext.getAsync(I18nService);

    return this.resposes.error(
      this.debug ? err.message + ((err as ValidationError).errors ? '; ' + (err as ValidationError).errors.join('、') : '') : i18n.translate('未知异常请联系管理员'),
      CodeEunm.Error,
    );
  }
}
