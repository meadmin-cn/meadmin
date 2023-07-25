import { Logger as NestLogger } from '@nestjs/common';
const logger = new NestLogger('sequelize');

export class DatabaseLogger {
  // 实现logger类的所有方法

  logQuery(query: string, time: number) {
    if (time > 5000) {
      this.logQuerySlow(query, time);
    } else {
      logger.log(`${query} -- time: ${time} ms`);
    }
  }

  logQuerySlow(query: string, time: number) {
    logger.warn(`${query} -- time: ${time} ms`);
  }
}
