import { IMidwayApplication, IMidwayContainer, MidwayDecoratorService } from '@midwayjs/core';

export * from './swagger.js';
export * from './sequelize.js';
export * from './index/permission.js';
export * from './transactions.js';
export * from './admin/permission.js';

import { SequelizeRegistreDecorators } from './sequelize.js';
import { IndexPermissionRegistreDecorators } from './index/permission.js';
import {AdminPermissionRegistreDecorators} from './admin/permission.js';
import { RegistreDecorator } from '../../types/decorator.js';
import {TransactionRegistreDecorators} from './transactions.js';

export class RegistreDecorators {
  decoratorService: MidwayDecoratorService;

  regitserDecorators: RegistreDecorator[] = [
    new SequelizeRegistreDecorators(),
    new IndexPermissionRegistreDecorators(),
    new AdminPermissionRegistreDecorators(),
    new TransactionRegistreDecorators()
  ];
  /**
   * 对象初始化时自动执行的方法
   * @returns
   */
  async init() {
    return await Promise.all(this.regitserDecorators.map(v=>v.init?.(this.decoratorService)));
  }

  /**
   * 在应用配置加载后执行
   */
  async onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication) {
    return await Promise.all(this.regitserDecorators.map(v=>v.onConfigLoad?.(container,app)));
  }

  /**
   * 在依赖注入容器 ready 的时候执行
   */
  async onReady?(container: IMidwayContainer, app: IMidwayApplication) {
    return await Promise.all(this.regitserDecorators.map(v=>v.onReady?.(container,app)));
  }

  /**
   * 在应用服务启动后执行
   */
  async onServerReady?(container: IMidwayContainer, app: IMidwayApplication) {
    return await Promise.all(this.regitserDecorators.map(v=>v.onServerReady?.(container,app)));
  }

  /**
   * 在应用停止的时候执行
   */
  async onStop?(container: IMidwayContainer, app: IMidwayApplication) {
    return await Promise.all(this.regitserDecorators.map(v=>v.onStop?.(container,app)));
  }

  /**
   * 在健康检查时执行
   */
  async onHealthCheck?(container: IMidwayContainer) {
    return await Promise.all(this.regitserDecorators.map(v=>v.onHealthCheck?.(container)));

  }
}
