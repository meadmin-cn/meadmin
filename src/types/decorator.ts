import { IMidwayApplication, IMidwayContainer, MidwayDecoratorService } from '@midwayjs/core';

export interface RegistreDecorator {
  /**
   * 对象初始化时自动执行的方法
   * @returns
   */
  init?(decoratorService: MidwayDecoratorService): Promise<void>;
  /**
   * 在应用配置加载后执行
   */
  onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;

  /**
   * 在依赖注入容器 ready 的时候执行
   */
  onReady?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;
  /**
   * 在应用服务启动后执行
   */
  onServerReady?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;
  /**
   * 在应用停止的时候执行
   */
  onStop?(container: IMidwayContainer, app: IMidwayApplication): Promise<void>;

  /**
   * 在健康检查时执行
   */
  onHealthCheck?(container: IMidwayContainer): Promise<void>;
}
