import './helper/dotenv.js';
import { Configuration, App, IMidwayContainer, Init, IMidwayApplication, Inject, MidwayDecoratorService } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import { DefaultErrorFilter } from './filter/default.filter.js';
import { NotFoundFilter } from './filter/notfound.filter.js';
// import { ReportMiddleware } from './middleware/report.middleware.js';
import DefaultConfig from '@/config/config.default.js';
import UnittestConfig from '@/config/config.unittest.js';
import * as meadmin from '@meadmin/core';
import { ValidateErrorFilter } from './filter/validate.filter.js';
import * as swagger from '@midwayjs/swagger';
import {RegistreDecorators} from './decorators/index.js';
import * as viteView from 'midway-vite-view';//引入view组件

const registreDecorators = new RegistreDecorators();


@Configuration({
  imports: [
    koa,
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

  @Init()
  async init(){
    registreDecorators.decoratorService = this.decoratorService;
    registreDecorators.init();
  } 

  /**
    * 在应用配置加载后执行
    */
  async onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication){
    registreDecorators.onConfigLoad(container,app);
  };
  
  /**
   * 在依赖注入容器 ready 的时候执行
   */
  async onReady?(container: IMidwayContainer, app: IMidwayApplication){
      this.app.useFilter([
      ValidateErrorFilter,
      NotFoundFilter,
      DefaultErrorFilter,
    ]);
    registreDecorators.onReady(container,app);
  };

  /**
   * 在应用服务启动后执行
   */
  async onServerReady?(container: IMidwayContainer, app: IMidwayApplication){
      registreDecorators.onServerReady(container,app);

  };

  /**
   * 在应用停止的时候执行
   */
  async onStop?(container: IMidwayContainer, app: IMidwayApplication){
            registreDecorators.onStop(container,app);

  };

  /**
   * 在健康检查时执行
   */
  async onHealthCheck?(container: IMidwayContainer){
              registreDecorators.onHealthCheck(container);

  };


}
