import { setCtx } from '../index.js';
import { IMiddleware, Middleware, NextFunction } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
//设置全局 ctx
@Middleware()
export class GlobaleMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      setCtx(ctx);
      await next();
      setCtx(null);
    };
  }
}
