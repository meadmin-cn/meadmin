import { IMidwayApplication, IMidwayContainer, MidwayDecoratorService } from '@midwayjs/core';

export * from './swagger.js';
export * from './sequelize.js';

import { SequelizeRegistreDecorators } from './sequelize.js';
const sequelizeRegistreDecorators = new SequelizeRegistreDecorators();
export class RegistreDecorators {
  decoratorService: MidwayDecoratorService;

  /**
   * 对象初始化时自动执行的方法
   * @returns
   */
  async init() {
    sequelizeRegistreDecorators.decoratorService = this.decoratorService;
    return await Promise.all([sequelizeRegistreDecorators.init()]);
  }

  /**
   * 在应用配置加载后执行
   */
  async onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication) {}

  /**
   * 在依赖注入容器 ready 的时候执行
   */
  async onReady?(container: IMidwayContainer, app: IMidwayApplication) {
    return await Promise.all([sequelizeRegistreDecorators.onReady(container)]);
  }

  /**
   * 在应用服务启动后执行
   */
  async onServerReady?(container: IMidwayContainer, app: IMidwayApplication) {}

  /**
   * 在应用停止的时候执行
   */
  async onStop?(container: IMidwayContainer, app: IMidwayApplication) {
    return await Promise.all([sequelizeRegistreDecorators.onStop()]);
  }

  /**
   * 在健康检查时执行
   */
  async onHealthCheck?(container: IMidwayContainer) {}
}
