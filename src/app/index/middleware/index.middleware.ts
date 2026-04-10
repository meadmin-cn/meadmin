import { IMiddleware, NextFunction } from '@midwayjs/core';
import { Inject, Middleware } from '@midwayjs/core';
import { UnauthorizedError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';
import { LoginService } from '../service/login.serveice.js';

@Middleware()
export class IndexMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  loginService: LoginService; // 这里注入的实例和上下文不绑定，无法获取到 ctx

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const token = ctx.get('Authorization').replace('Bearer ', '');
      if (token) {
        const userInfo = await this.loginService.getUserByToken(token);
        if (!userInfo) {
          throw new UnauthorizedError('登录信息已失效请重新登录！');
        }
        if (userInfo.status !== 1) {
          this.loginService.removeToken(token);
          throw new UnauthorizedError('用户已被禁用');
        }
        ctx.userInfo = userInfo;
      }
      return await next();
    };
  }
}
