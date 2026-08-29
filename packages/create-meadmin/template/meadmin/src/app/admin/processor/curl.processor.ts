import { buildUrl } from '@/helper/url.js';
import { SequelizeDataSourceManagerService } from '@/service/dataSourceManager.service.js';
import { IProcessor, Processor } from '@midwayjs/bullmq';
import { Inject, makeHttpRequest } from '@midwayjs/core';
import { processorOptions } from './default.options.js';

@Processor('curl-task', processorOptions['curl-task'].jobOptions, processorOptions['curl-task'].workerOptions, processorOptions['curl-task'].queueOptions)
export class CurlProcessor implements IProcessor {
  @Inject()
  dataSourceManager: SequelizeDataSourceManagerService;

  async execute(options: { url: string; method: string; headers?: Record<string, any>; query?: Record<string, any>; body?: Record<string, any> }) {
    const result = await makeHttpRequest(buildUrl(options.url, options.query), {
      method: options.method,
      headers: options.headers,
      data: options.body,
      contentType: 'json', // 发送的body为 json
      dataType: 'json', // 返回的数据格式
      timeout: 3600 * 1000,
    });
    return JSON.stringify(result);
  }
}
