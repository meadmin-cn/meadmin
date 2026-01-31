// src/decorator/logging.decorator.ts
import { RegistreDecorator } from '@/types/decorator.js';
import { createCustomMethodDecorator, JoinPoint, MidwayDecoratorService, REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';
import { ForbiddenError, UnauthorizedError } from '@midwayjs/core/dist/error/http.js';
import { Context } from '@midwayjs/koa';

// 装饰器内部的唯一 id
export const ADMIN_PERMISSION_KEY = 'decorator:admin_promise';

export function AdminPermission(rule: string | string[]): MethodDecorator {
  // 我们传递了一个可以修改展示格式的参数
  return createCustomMethodDecorator(ADMIN_PERMISSION_KEY, { rules: Array.isArray(rule) ? rule : [rule] });
}
export class AdminPermissionRegistreDecorators implements RegistreDecorator {
  decoratorService: MidwayDecoratorService;
  async init(decoratorService: MidwayDecoratorService) {
    this.decoratorService = decoratorService;
  }
  async onReady() {
    // 实现方法装饰器
    this.decoratorService.registerMethodHandler(ADMIN_PERMISSION_KEY, (options) => {
      return {
        around: async (joinPoint: JoinPoint) => {
          // 装饰器所在的实例
          const instance = joinPoint.target;
          const ctx = instance[REQUEST_OBJ_CTX_KEY] as Context;
          if (!ctx.adminInfo) {
            throw new UnauthorizedError('请登录后再访问！');
          }
          if (!ctx.adminInfo.roles.some((item) => item.isSuper === 1) && !ctx.adminInfo.roleMenus.some((item) => options.metadata.rules.include(item.rule))) {
            throw new ForbiddenError('无权限访问！');
          }
          // 执行原方法
          const result = await joinPoint.proceed(...joinPoint.args);
          // 返回执行结果
          return result;
        },
      };
    });
  }
}
