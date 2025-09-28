import './helper/dotenv.js';
import { Configuration, App, IMidwayContainer, Init, IMidwayApplication, Inject, MidwayDecoratorService, Logger, ILogger } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';

// import { ReportMiddleware } from './middleware/report.middleware.js';
import DefaultConfig from '@/config/config.default.js';
import UnittestConfig from '@/config/config.unittest.js';
import * as meadmin from '@meadmin/core';
import * as swagger from '@midwayjs/swagger';
import { RegistreDecorators } from './decorators/index.js';
import * as viteView from 'midway-vite-view'; //引入view组件
import * as cacheManager from '@midwayjs/cache-manager';

import * as redis from '@midwayjs/redis';
import { filters } from './filter/index.js';
import { initLogger } from './logger.js';
import * as i18n from '@midwayjs/i18n';
const registreDecorators = new RegistreDecorators();

@Configuration({
  imports: [
    koa,
    i18n,
    meadmin, //必须放在swagger之前引入
    validate,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    {
      component: swagger,
      enabledEnvironment: ['local', 'dev'],
    },
    viteView,
    redis,
    cacheManager,
  ],
  importConfigs: [
    {
      default: DefaultConfig,
      unittest: UnittestConfig,
    },
  ],
})
export class MainConfiguration {
  @App('koa')
  app: koa.Application;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Logger()
  appLogger: ILogger;

  @Logger('coreLogger')
  coreLogger: ILogger;

  @Init()
  async init() {
    registreDecorators.decoratorService = this.decoratorService;
    registreDecorators.init();
  }

  /**
   * 在应用配置加载后执行
   */
  async onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication) {
    registreDecorators.onConfigLoad(container, app);
  }

  /**
   * 在依赖注入容器 ready 的时候执行
   */
  async onReady?(container: IMidwayContainer, app: IMidwayApplication) {
    initLogger(this.appLogger, this.coreLogger);
    this.app.useFilter(filters);
    registreDecorators.onReady(container, app);
  }

  /**
   * 在应用服务启动后执行
   */
  async onServerReady?(container: IMidwayContainer, app: IMidwayApplication) {
    registreDecorators.onServerReady(container, app);
  }

  /**
   * 在应用停止的时候执行
   */
  async onStop?(container: IMidwayContainer, app: IMidwayApplication) {
    registreDecorators.onStop(container, app);
  }

  /**
   * 在健康检查时执行
   */
  async onHealthCheck?(container: IMidwayContainer) {
    registreDecorators.onHealthCheck(container);
  }
}
