import { CodeEunm } from '@/dict/code.enum.js';
import { ResponseService } from '@/service/response.service.js';
import { IMiddleware, Middleware, NextFunction } from '@midwayjs/core';
import { ForbiddenError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';

// 公共过滤器未注册 ForbiddenError，仅为 CMS 补齐规范业务错误码。
@Middleware()
export class CmsPermissionMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      try {
        return await next();
      } catch (error) {
        if (!(error instanceof ForbiddenError)) throw error;
        // 使用 ctx.requestContext 动态获取请求作用域的 ResponseService
        const responseService = await ctx.requestContext.getAsync(ResponseService);
        return responseService.error('无权限访问！', CodeEunm.Forbidden);
      }
    };
  }
}
