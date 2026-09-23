import { IMiddleware, Middleware, NextFunction } from '@midwayjs/core';
import { NotFoundError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';

// 仅规范 CMS 公开接口的不存在响应，不影响框架其他模块的 404 页面。
@Middleware()
export class CmsNotFoundMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      try {
        return await next();
      } catch (error) {
        if (!(error instanceof NotFoundError)) throw error;
        ctx.status = 404;
        return { code: '404', msg: '内容不存在' };
      }
    };
  }
}
