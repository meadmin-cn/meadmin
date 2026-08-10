import { SequelizeDataSourceManagerService } from '@/service/dataSourceManager.service.js';
import { IProcessor, Processor } from '@midwayjs/bullmq';
import { Inject } from '@midwayjs/core';

@Processor('sql-task')
export class SqlProcessor implements IProcessor {
  @Inject()
  dataSourceManager: SequelizeDataSourceManagerService;

  async execute(options: { sql: string; sourceName?: string }) {
    const seqlize = this.dataSourceManager.getDataSource(options.sourceName ?? this.dataSourceManager.getDefaultDataSourceName());
    return await seqlize.query(options.sql);
  }
}
