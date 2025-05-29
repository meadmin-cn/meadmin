import { MidwayConfig } from '@midwayjs/core';
import database from './database.js';
export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1714030878233_897',
  koa: {
    port: 7001,
  },
  debug: true,
  validate: {
    validationOptions: {
      allowUnknown: true, // 全局生效 允许未定义的字段
      convert: true, // 当为true时，尝试将值转换为所需的类型（例如，将字符串转换为数字.
      stripUnknown: true, // 全局生效,移除多余的字段
    },
  },
  i18n: {
    // 把你的翻译文本放到这里
    localeTable: {
      zh_CN: {
        validate: {
          'string.mobile': '{{#label}} 必须是一个正确的手机号',
        },
      },
    },
  },
  sequelize: await database(),
} as MidwayConfig;
