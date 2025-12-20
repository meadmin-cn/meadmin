import { IMidwayApplication, IMidwayContainer, MidwayDecoratorService } from '@midwayjs/core';

interface RegistreDecorator{
   /**
     * 对象初始化时自动执行的方法
     * @returns
     */
    async init?(decoratorService: MidwayDecoratorService):void
    /**
     * 在应用配置加载后执行
     */
    async onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication):void
  
    /**
     * 在依赖注入容器 ready 的时候执行
     */
    async onReady?(container: IMidwayContainer, app: IMidwayApplication):void
    /**
     * 在应用服务启动后执行
     */
    async onServerReady?(container: IMidwayContainer, app: IMidwayApplication):void
    /**
     * 在应用停止的时候执行
     */
    async onStop?(container: IMidwayContainer, app: IMidwayApplication):void
  
    /**
     * 在健康检查时执行
     */
    async onHealthCheck?(container: IMidwayContainer):void
}