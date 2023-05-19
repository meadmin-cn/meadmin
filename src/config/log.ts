import { formatToString } from '@/helpers/format';
import { LogConfig } from '@/interfaces/config/log.inerface';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
const formats = [
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.align(),
  winston.format.printf((info) => {
    let message = `[${info.level}][${[info.timestamp]}]: ${info.message}`;
    if (info.context !== undefined) {
      message += '   [context]:' + formatToString(info.context);
    }
    if (info.stack !== undefined) {
      message += '   [stack]:' + formatToString(info.stack);
    }
    return message;
  }),
];
export default (): LogConfig => {
  const transports = [
    new winston.transports.DailyRotateFile({
      //文件归档
      dirname: `logs`, // 日志保存的目录
      filename: '%DATE%.log', // 日志名称，占位符 %DATE% 取值为 datePattern 值。
      datePattern: 'YYYY-MM-DD', // 日志轮换的频率，此处表示每天。
      zippedArchive: true, // 是否通过压缩的方式归档被轮换的日志文件。
      maxSize: '20m', // 设置日志文件的最大大小，m 表示 mb 。
      maxFiles: '14d', // 保留日志文件的最大天数，此处表示自动删除超过 14 天的日志文件。
    }),
  ];
  return {
    level: 'debug', //日志记录级别 高于此几倍的日志会被记录 优先级 emerg>alert>crit>error>warning>notice>info>debug
    exitOnError: false,
    format: winston.format.combine(...formats),
    transports:
      process.env.NODE_ENV === 'devdevelopment'
        ? [
            ...transports,
            new winston.transports.Console({
              // 控制台打印
              format: winston.format.combine(
                winston.format.colorize(),
                ...formats,
              ),
            }),
          ]
        : transports,
  };
};
