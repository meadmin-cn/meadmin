import { App, Configuration, ESModuleFileDetector, ILogger, IMidwayApplication, IMidwayContainer, Init, Inject, Logger, MidwayDecoratorService } from '@midwayjs/core';
import * as info from '@midwayjs/info';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import './helper/dotenv.js';
// import { ReportMiddleware } from './middleware/report.middleware.js';
import DefaultConfig from '@/config/config.default.js';
import * as meadmin from '@meadmin/core';
import * as viteView from '@meadmin/midway-vite-view'; //引入view组件
import * as bullmq from '@midwayjs/bullmq';
import * as busboy from '@midwayjs/busboy';
import * as cacheManager from '@midwayjs/cache-manager';
import * as captcha from '@midwayjs/captcha';
import * as i18n from '@midwayjs/i18n';
import * as redis from '@midwayjs/redis';
import * as staticFile from '@midwayjs/static-file';
import * as swagger from '@midwayjs/swagger';
import { Op, sql } from '@sequelize/core';
import dayjs from 'dayjs';
import { RegistreDecorators } from './decorators/index.js';
import { Job } from './entities/job.entity.js';
import { filters } from './filter/index.js';
import { initLogger } from './logger.js';
import { SequelizeDataSourceManagerService } from './service/dataSourceManager.service.js';
const registreDecorators = new RegistreDecorators();
const imports = [];
if (process.env.MODE !== 'ONLY_WORKER') {
  imports.push(koa);
}
imports.push(
  ...[
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
  ],
);
if (process.env.MODE !== 'ONLY_WORKER') {
  imports.push(viteView);
}
@Configuration({
  imports: [...imports, redis, cacheManager, captcha, busboy, bullmq],
  detector: new ESModuleFileDetector({
    ignore: process.env.MODE === 'ONLY_API' ? ['**/processor/**'] : [],
  }),
  importConfigs: [
    {
      default: DefaultConfig,
    },
  ],
})
export class MainConfiguration {
  @App(process.env.MODE !== 'ONLY_WORKER' ? 'koa' : undefined)
  app: koa.Application;

  @Inject()
  decoratorService: MidwayDecoratorService;

  @Logger()
  appLogger: ILogger;

  @Logger('coreLogger')
  coreLogger: ILogger;

  @Inject()
  bullmqFramework: bullmq.Framework;

  @Init()
  async init() {
    registreDecorators.decoratorService = this.decoratorService;
    await registreDecorators.init();
  }

  /**
   * 在应用配置加载后执行
   */
  async onConfigLoad?(container: IMidwayContainer, app: IMidwayApplication) {
    await registreDecorators.onConfigLoad?.(container, app);
  }

  /**
   * 在依赖注入容器 ready 的时候执行
   */
  async onReady?(container: IMidwayContainer, app: IMidwayApplication) {
    initLogger(this.appLogger, this.coreLogger);
    this.app.useFilter(filters);
    await registreDecorators.onReady?.(container, app);
    const dataSourceManager = await container.getAsync(SequelizeDataSourceManagerService);
    const jobRepository = dataSourceManager.getDataSource(dataSourceManager.getDataSourceNameByModel(Job) || dataSourceManager.getDefaultDataSourceName()).models.get<Job>(Job.name);
    if (!jobRepository) {
      return this.appLogger.error('设置队列任务监听失败，jobRepository创建失败');
    }
    setTimeout(() => {
      //监听队列状态,放到下一个宏任务才能监听到，在生命周期内监听不到
      this.bullmqFramework.getQueueList().forEach((queue) => {
        queue.on('waiting', (job) => {
          //TODO::midway更新为可设置独立执行worker后待优化为仅在投递进程监听
          // Job is waiting to be processed.
          jobRepository
            .update(
              { status: 'waiting', jobId: job.id },
              {
                where: {
                  name: job.name,
                  jobId: {
                    [Op.ne]: job.id,
                  },
                },
                transaction: null,
              },
            )
            .catch((err: Error) => {
              this.appLogger.error('Error updating job status to active:', err.stack || '');
            });
        });
        if (process.env.MODE !== 'ONLY_API') {
          this.bullmqFramework.getWorkers(queue.name).forEach((worker) => {
            worker.on('active', (job) => {
              jobRepository
                .update(
                  { status: 'active', jobId: job.id },
                  {
                    where: {
                      name: job.name,
                    },
                    transaction: null,
                  },
                )
                .catch((err: Error) => {
                  this.appLogger.error('Error updating job status to active:', err.stack || '');
                });
            });
            worker.on('progress', (job, progress) => {
              jobRepository
                .update(
                  { status: 'active', progress: Number(progress), jobId: job.id },
                  {
                    where: {
                      name: job.name,
                    },
                    transaction: null,
                  },
                )
                .catch((err: Error) => {
                  this.appLogger.error('Error updating job progress:', err.stack || '');
                });
            });
            worker.on('completed', (job, result) => {
              console.log(333, job.name);

              const successResult = JSON.stringify({
                result: result,
                jobId: job.id,
                time: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS'),
              });
              jobRepository
                .update(
                  { status: 'completed', progress: 100, result: sql`${sql.attribute(jobRepository.modelDefinition.getColumnName('result'))} || ${successResult}::jsonb`, sucessedNum: sql` ${sql.attribute(jobRepository.modelDefinition.getColumnName('sucessedNum'))} + 1 `, jobId: job.id },
                  {
                    where: {
                      name: job.name,
                    },
                    transaction: null,
                  },
                )
                .catch((err: Error) => {
                  this.appLogger.error('Error updating job status to completed:' + err.message, err.stack || '');
                });
            });
            worker.on('failed', (job, error) => {
              if (job) {
                const jobRepository = dataSourceManager.getDataSource(dataSourceManager.getDataSourceNameByModel(Job) || dataSourceManager.getDefaultDataSourceName()).models.get<Job>(Job.name)!;
                const failedResponse = JSON.stringify({
                  message: error?.message || '',
                  stack: error?.stack || '',
                  jobId: job?.id || '',
                  time: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS'),
                });
                jobRepository
                  .update(
                    { status: 'failed', failedResponse: sql`${sql.attribute(jobRepository.modelDefinition.getColumnName('failedResponse'))} || ${failedResponse}::jsonb`, failedNum: sql`${sql.attribute(jobRepository.modelDefinition.getColumnName('failedNum'))} + 1`, jobId: job?.id || undefined },
                    {
                      where: {
                        name: job.name,
                      },
                      transaction: null,
                    },
                  )
                  .catch((err: Error) => {
                    this.appLogger.error('Error updating job status to failed:' + err.message, err.stack || '');
                  });
              }
            });
          });
        }
      });
    }, 0);
  }

  /**
   * 在应用服务启动后执行
   */
  async onServerReady?(container: IMidwayContainer, app: IMidwayApplication) {
    await registreDecorators.onServerReady?.(container, app);
  }

  /**
   * 在应用停止的时候执行
   */
  async onStop?(container: IMidwayContainer, app: IMidwayApplication) {
    await registreDecorators.onStop?.(container, app);
  }

  /**
   * 在健康检查时执行
   */
  async onHealthCheck?(container: IMidwayContainer) {
    await registreDecorators.onHealthCheck?.(container);
  }
}
