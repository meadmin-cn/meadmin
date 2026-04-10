import { globalAsyncLocalStorage, removeAsyncGlobal, setAsyncGloabel } from '@/asyncGlobal.js';
import { IMiddleware, NextFunction } from '@midwayjs/core';
import { Middleware } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
let idSeq = 0;

//设置全局 ctx
@Middleware()
export class GlobaleMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      let id = 'meadmin_' + idSeq;
      await globalAsyncLocalStorage.run(id, async () => {
        if (idSeq === Number.MAX_SAFE_INTEGER) {
          //达到最大安全整数时还原，只要此间隔为Number.MAX_SAFE_INTEGER的请求结束就不会有问题
          idSeq = 0;
        }
        id = 'meadmin_' + idSeq++;
        setAsyncGloabel('ctx', ctx);
        try {
          await next();
        } finally {
          removeAsyncGlobal(undefined, id);
        }
      });
    };
  }
}
