import { Config, IMiddleware, Inject, Middleware, NextFunction } from '@midwayjs/core';
import { UnauthorizedError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';
import { LoginService } from '../service/login.serveice.js';

@Middleware()
export class AdminMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  loginService: LoginService; // 这里注入的实例和上下文不绑定，无法获取到 ctx

  @Config('admin.auth.noLoginUrl')
  noLoginUrl: Array<string | RegExp>;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      if (
        !this.noLoginUrl.some((item) => {
          if (item instanceof RegExp) {
            return item.test(ctx.path);
          }
          return item === ctx.path;
        })
      ) {
        const token = ctx.get('Authorization').replace('Bearer ', '');
        if (!token) {
          throw new UnauthorizedError('请登录后再访问！');
        }
        const adminInfo = await this.loginService.getAdminByToken(token);
        if (!adminInfo) {
          throw new UnauthorizedError('登录信息已失效请重新登录！');
        }
        if (adminInfo.status !== 1) {
          this.loginService.removeToken(token);
          throw new UnauthorizedError('用户已被禁用！');
        }
        ctx.adminInfo = adminInfo;
      }
      await next();
    };
  }
}
