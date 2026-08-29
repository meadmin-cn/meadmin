import { SequelizeDataSourceManagerService } from '@/service/dataSourceManager.service.js';
import { IProcessor, Processor } from '@midwayjs/bullmq';
import { Inject } from '@midwayjs/core';
import { processorOptions } from './default.options.js';

@Processor('sql-task', processorOptions['sql-task'].jobOptions, processorOptions['sql-task'].workerOptions, processorOptions['sql-task'].queueOptions)
export class SqlProcessor implements IProcessor {
  @Inject()
  dataSourceManager: SequelizeDataSourceManagerService;

  async execute(options: { sql: string; sourceName?: string }) {
    const seqlize = this.dataSourceManager.getDataSource(options.sourceName ?? this.dataSourceManager.getDefaultDataSourceName());
    return await seqlize.query(options.sql);
  }
}
