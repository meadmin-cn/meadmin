// src/decorator/logging.decorator.ts
import { RegistreDecorator } from '@/types/decorator.js';
import { JoinPoint, MidwayDecoratorService } from '@midwayjs/core';
import { createCustomMethodDecorator, REQUEST_OBJ_CTX_KEY } from '@midwayjs/core';
import { UnauthorizedError } from '@midwayjs/core/dist/error/http.js';

// 装饰器内部的唯一 id
export const INDEX_PERMISSION_KEY = 'decorator:index_promise';

export function IndexPermission(): MethodDecorator {
  // 我们传递了一个可以修改展示格式的参数
  return createCustomMethodDecorator(INDEX_PERMISSION_KEY, {});
}
export class IndexPermissionRegistreDecorators implements RegistreDecorator {
  decoratorService: MidwayDecoratorService;
  async init(decoratorService: MidwayDecoratorService) {
    this.decoratorService = decoratorService;
  }
  async onReady() {
    // 实现方法装饰器
    this.decoratorService.registerMethodHandler(INDEX_PERMISSION_KEY, () => {
      return {
        around: async (joinPoint: JoinPoint) => {
          // 装饰器所在的实例
          const instance = joinPoint.target;
          const ctx = instance[REQUEST_OBJ_CTX_KEY];
          if (!ctx.userInfo) {
            throw new UnauthorizedError('请登录后再访问！');
          }
          // 执行原方法
          const result = await joinPoint.proceed?.(...joinPoint.args);
          // 返回执行结果
          return result;
        },
      };
    });
  }
}
