import { App, Configuration, ILogger, IMidwayApplication, IMidwayContainer, Init, Inject, Logger, MidwayDecoratorService } from '@midwayjs/core';
import * as info from '@midwayjs/info';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import './helper/dotenv.js';
// import { ReportMiddleware } from './middleware/report.middleware.js';
import DefaultConfig from '@/config/config.default.js';
import * as meadmin from '@meadmin/core';
import * as viteView from '@meadmin/midway-vite-view'; //引入view组件
import * as busboy from '@midwayjs/busboy';
import * as cacheManager from '@midwayjs/cache-manager';
import * as captcha from '@midwayjs/captcha';
import * as i18n from '@midwayjs/i18n';
import * as redis from '@midwayjs/redis';
import * as staticFile from '@midwayjs/static-file';
import * as swagger from '@midwayjs/swagger';
import { RegistreDecorators } from './decorators/index.js';
import { filters } from './filter/index.js';
import { initLogger } from './logger.js';

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
    staticFile,
    viteView,
    redis,
    cacheManager,
    captcha,
    busboy,
  ],
  importConfigs: [
    {
      default: DefaultConfig,
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
    await registreDecorators.init();
  }

  /**
   * 在应用配置加载后执行
   */
  async onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication) {
    registreDecorators.onConfigLoad?.(container, app).catch((err) => {
      this.appLogger.error('Error in onConfigLoad:', err);
    });
  }

  /**
   * 在依赖注入容器 ready 的时候执行
   */
  async onReady?(container: IMidwayContainer, app: IMidwayApplication) {
    initLogger(this.appLogger, this.coreLogger);
    this.app.useFilter(filters);
    registreDecorators.onReady?.(container, app).catch((err) => {
      this.appLogger.error('Error in onReady:', err);
    });
  }

  /**
   * 在应用服务启动后执行
   */
  async onServerReady?(container: IMidwayContainer, app: IMidwayApplication) {
    registreDecorators.onServerReady?.(container, app).catch((err) => {
      this.appLogger.error('Error in onServerReady:', err);
    });
  }

  /**
   * 在应用停止的时候执行
   */
  async onStop?(container: IMidwayContainer, app: IMidwayApplication) {
    registreDecorators.onStop?.(container, app).catch((err) => {
      this.appLogger.error('Error in onStop:', err);
    });
  }

  /**
   * 在健康检查时执行
   */
  async onHealthCheck?(container: IMidwayContainer) {
    registreDecorators.onHealthCheck?.(container).catch((err) => {
      this.appLogger.error('Error in onHealthCheck:', err);
    });
  }
}
