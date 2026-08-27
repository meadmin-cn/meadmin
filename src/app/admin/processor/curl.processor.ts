import { SequelizeDataSourceManagerService } from '@/service/dataSourceManager.service.js';
import { IProcessor, Processor } from '@midwayjs/bullmq';
import { Inject, makeHttpRequest } from '@midwayjs/core';

@Processor('curl-task')
export class CurlProcessor implements IProcessor {
  @Inject()
  dataSourceManager: SequelizeDataSourceManagerService;

  async execute(options: { url: string; method: string; headers?: Record<string, any>; query?: Record<string, any>; body?: Record<string, any> }) {
    const result = await makeHttpRequest(options.url, {
      method: options.method,
      data: options.body,
      contentType: 'json', // 发送的body为 json
      dataType: 'json', // 返回的数据格式
      timeout: 3600 * 1000,
    });
    return JSON.stringify(result);
  }
}
