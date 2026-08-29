//队列任务配置文件,请在此处声明而不是在任务装饰器写死，以便于投递任务进程可加载到
import { Processor } from '@midwayjs/bullmq';
export const processorOptions: Record<
  string,
  {
    jobOptions?: Parameters<typeof Processor>[1];
    workerOptions?: Parameters<typeof Processor>[2];
    queueOptions?: Parameters<typeof Processor>[3];
  }
> = {
  'curl-task': {},
  'sql-task': {},
};
