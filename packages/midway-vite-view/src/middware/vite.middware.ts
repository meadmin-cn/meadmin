import { Middleware, IMiddleware, Init, Inject, HttpServerResponse } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import { ViteService, MiddlewareArr } from '../service/vite.service.js';

@Middleware()
export class ViteMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  viteService: ViteService;

  private viteMiddlewareArr: MiddlewareArr = [];

  @Init()
  async init() {
    this.viteMiddlewareArr = await this.viteService.getViteMiddlewareArr();
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (ctx.originalUrl === '/.well-known/appspecific/com.chrome.devtools.json') {
        return  new HttpServerResponse(ctx).status(404);
      }
      for (let i = 0; i < this.viteMiddlewareArr.length; i++) {
        if (ctx.originalUrl.startsWith(this.viteMiddlewareArr[i].prefix)) {
          return await this.viteMiddlewareArr[i].middleware(ctx, next);
        }
      }
      return await next();
    };
  }

  static getName(): string {
    return 'viteView';
  }
}
