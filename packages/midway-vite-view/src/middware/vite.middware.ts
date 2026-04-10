import {
  IMiddleware
} from '@midwayjs/core';
import {
  HttpServerResponse,
  Init,
  Inject,
  Middleware,
} from '@midwayjs/core';
import { IMidwayKoaContext, NextFunction } from '@midwayjs/koa';
import { MiddlewareArr, ViteService } from '../service/vite.service.js';

@Middleware()
export class ViteMiddleware implements IMiddleware<IMidwayKoaContext, NextFunction> {
  @Inject()
  viteService: ViteService;

  private viteMiddlewareArr: MiddlewareArr = [];

  @Init()
  async init() {
    this.viteMiddlewareArr = await this.viteService.getViteMiddlewareArr();
  }

  resolve() {
    return async (ctx: IMidwayKoaContext, next: NextFunction) => {
      if (
        ctx.originalUrl === '/.well-known/appspecific/com.chrome.devtools.json'
      ) {
        return new HttpServerResponse(ctx).status(404);
      }
      for (let i = 0; i < this.viteMiddlewareArr.length; i++) {
        if (ctx.originalUrl.startsWith(this.viteMiddlewareArr[i].prefix)) {
          return await this.viteMiddlewareArr[i].middleware(ctx, next);
        }
      }
      await next();
    };
  }

  static getName(): string {
    return 'viteView';
  }
}
