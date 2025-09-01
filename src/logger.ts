import { ILogger } from '@midwayjs/core';

export let appLogger: ILogger = {
   info:console.log,
   debug:console.log,
   error:console.log,
   warn:console.log
}; //应用logger 必须在ready 后调用
export let coreLogger: ILogger= {
   info:console.log,
   debug:console.log,
   error:console.log,
   warn:console.log
}; //框架级别logger 必须在ready 后调用

/**
 * 初始化log方法
 * @param appLoggerFn
 * @param coreLoggerFn
 */
export const initLogger = (appLoggerFn: ILogger, coreLoggerFn: ILogger) => {
  appLogger = appLoggerFn;
  coreLogger = coreLoggerFn;
};
