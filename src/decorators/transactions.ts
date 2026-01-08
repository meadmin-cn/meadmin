// 开启事务
import { createCustomMethodDecorator, IMidwayContainer, JoinPoint, MidwayDecoratorService } from '@midwayjs/core';
import { RegistreDecorator } from '@/types/decorator.js';
import { SequelizeDataSourceManagerService } from '@/service/dataSourceManager.service.js';
import { ManagedTransactionOptions } from '@sequelize/core';

// 装饰器内部的唯一 id
export const TRANSACTION_KEY = 'decorator:transaction';
export type TransactionOptions = {
  sourceName?: string; //使用的seqlize实例，不传使用默认值
  options?: ManagedTransactionOptions; //事务参数
};
export function Transaction(options?: TransactionOptions): MethodDecorator {
  // 我们传递了一个可以修改展示格式的参数
  return createCustomMethodDecorator(TRANSACTION_KEY, options);
}
export class TransactionRegistreDecorators implements RegistreDecorator {
  decoratorService: MidwayDecoratorService;
  async init(decoratorService: MidwayDecoratorService) {
    this.decoratorService = decoratorService;
  }
  async onReady(container: IMidwayContainer) {
    // 实现方法装饰器
    this.decoratorService.registerMethodHandler(TRANSACTION_KEY, (options) => {
      return {
        around: async (joinPoint: JoinPoint) => {
          const dataSourceManager = await container.getAsync(SequelizeDataSourceManagerService);
          const seqlize = dataSourceManager.getDataSource(options.metadata?.sourceName ?? dataSourceManager.getDefaultDataSourceName());
          return options.metadata?.options
            ? await seqlize.transaction(options.metadata.options, async () => {
                // 执行原方法
                return await joinPoint.proceed(...joinPoint.args);
              })
            : await seqlize.transaction(async () => {
                // 执行原方法
                return await joinPoint.proceed(...joinPoint.args);
              });
        },
      };
    });
  }
}
