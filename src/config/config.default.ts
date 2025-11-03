import { MidwayConfig } from '@midwayjs/core';
import database from './database.js';
import { resolve } from 'path';
import { createRedisStore } from '@midwayjs/cache-manager';
import { uploadWhiteList } from '@midwayjs/busboy';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1714030878233_897',
  koa: {
    port: 7001,
  },
  debug: true,
  validate: {
    validationOptions: {
      allowUnknown: false, // 全局生效 允许未定义的字段
      convert: true, // 当为true时，尝试将值转换为所需的类型（例如，将字符串转换为数字.
      stripUnknown: true, // 全局生效,移除多余的字段
    },
  },
  i18n: {
    // 默认语言  "zh-cn"
    defaultLocale: 'zh-cn',
    // used to alter the behaviour of missing keys
    missingKeyFn: function (locale, value) {
      return value
    },

    // 把你的翻译文本放到这里
    localeTable: {
      'zh-cn': {
        validate: {
          'string.mobile': '{{#label}} 必须是一个正确的手机号',
        },
      },
      'en': {
        default: await import('../locales/en.json', { with: { type: 'json' } }),
        validate: await import('@midwayjs/validate/locales/en_US.json', { with: { type: 'json' } }),
      },
    },
  },
  sequelize: await database(),
  view: {
    //midwayjs 视图配置 说明参考 https://midwayjs.org/docs/extensions/render
    defaultViewEngine: 'viteView',
  },
  viteView: {
    //midway-vite-view 配置配置详细说明见下方
    views: {
      // 'index/index.html': {
      //   entryServer: 'index/src/entry-server.ts',
      //   root: 'index',
      //   viteConfigFile: join(import.meta.dirname, '../../view/index/vite.config.ts')
      // },
      'admin/index.html': {
        // entryServer: 'admin/src/entry-server.ts',
        root: 'admin',
        viteConfigFile: resolve(import.meta.dirname, '../../view/admin/vite.config.ts'),
      },
    },
    root: '',
  },
  redis: {
    clients: {
      cache: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASS,
        db: 0,
      },
    },
  },
  cacheManager: {
    //缓存配置
    clients: {
      admin: {
        store: createRedisStore('cache'),
      },
    },
  },
  admin: {
    login: {
      secret: 'desec2ec3=ase$&e1#edad#$%%', //token加密平台标识
      expiresIn: 3600000 * 6, //token过期时间ms
      renewal: 60000 * 10, //续期时间ms
      cacheKey: 'admin', //token使用的缓存key对应cacheManager.clients
    },
    auth: {
      noLoginUrl: [`/api/admin/login/login`, `/api/admin/login/captcha`, new RegExp('/api/admin/file/get/.+')] as Array<string | RegExp>, //无需登录地址
    },
  },
  busboy: {
    mode: 'stream',
    // 扩展名白名单
    whitelist: uploadWhiteList,
    limits: {
      fileSize: 500*1024*1024,//上传限制 单位为byte
    },
    tmpdir: resolve(import.meta.dirname, '../../uploadFile/tmp'),
    upDir: resolve(import.meta.dirname, '../../uploadFile/'),
    cleanTimeout: 5 * 60 * 1000,
  },
} as MidwayConfig;
