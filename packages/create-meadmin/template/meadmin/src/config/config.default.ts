import { uploadWhiteList } from '@midwayjs/busboy';
import { createRedisStore } from '@midwayjs/cache-manager';
import { MidwayConfig } from '@midwayjs/core';
import { TranslateOptions } from '@midwayjs/i18n';
import { resolve, sep } from 'path';
import { formatText } from '../helper/utils.js';
import database from './database.js';
//配置文件避免出现@/等alisa，path引用
export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1714030878233_897',
  koa: {
    port: +process.env.SERVER_PORT!,
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
    missingKeyFn: function (_locale: any, value: any) {
      return value;
    },

    // 把你的翻译文本放到这里
    localeTable: {
      'zh-cn': {
        //默认翻译返回的就是中文翻译，只有校验的默认返回英文，需要中文转义
        validate: (await import('../locales/zh-cn.json', { with: { type: 'json' } })).default.validate,
      },
      'en': {
        default: await import('../locales/en.json', { with: { type: 'json' } }),
        validate: await import('@midwayjs/validate/locales/en_US.json', { with: { type: 'json' } }),
      },
    },

    missingKeyHandler: (message: string, options?: TranslateOptions) => (options?.args ? formatText(message, options.args) : message),
  },
  sequelize: await database(),
  view: {
    //midwayjs 视图配置 说明参考 https://midwayjs.org/docs/extensions/render
    defaultViewEngine: 'viteView',
  },
  // ...
  staticFile: {
    //静态资源配置，线上部署时建议使用nginx代理，开发环境可以使用midway内置的静态资源服务
    dirs: {
      default: {
        prefix: '/',
        dir: 'public',
      },
      viewAdmin: {
        prefix: '/html/admin/',
        dir: 'view/admin/dist',
        usePrecompiledGzip: true,
        alias: {
          //安全考虑，ssr-manifest.json文件不对外暴露，直接将其请求重定向到index.html
          ['/html/admin/ssr-manifest.json'.replaceAll('/', sep)]: '/html/admin/index.html'.replaceAll('/', sep),
        },
      },
      viewIndex: {
        prefix: '/html/index/',
        dir: 'view/index/dist',
        usePrecompiledGzip: true,
        alias: {
          //安全考虑，ssr-manifest.json文件不对外暴露，直接将其请求重定向到index.html
          ['/html/index/ssr-manifest.json'.replaceAll('/', sep)]: '/html/index/index.html'.replaceAll('/', sep),
        },
      },
    },
  },
  viteView: {
    //midway-vite-view 配置配置详细说明见下方
    rootDir: 'view',
    views: {
      admin: {
        //相对于rootDir的前端包路径
        // entryServer: 'admin/src/entry-server.ts',//admin暂未支持服务端渲染
        entry: 'index.html', //html入库文件，相对于当前包路径
        viteConfigFile: resolve(import.meta.dirname, '../../view/admin/vite.config.ts'),
        staticFileKey: 'viewAdmin',
        hmrPort: 23679,
      },
      index: {
        //相对于rootDir的前端包路径
        entryServer: 'src/entry-server.ts',
        entry: 'index.html', //html入库文件，相对于当前包路径
        viteConfigFile: resolve(import.meta.dirname, '../../view/index/vite.config.ts'),
        staticFileKey: 'viewIndex',
        hmrPort: 23680,
      },
    },
  },
  redis: {
    clients: {
      cache: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASS,
        db: process.env.REDIS_CACHE ?? 0,
      },
    },
  },
  cacheManager: {
    //缓存配置
    clients: {
      admin: {
        store: createRedisStore('cache'),
      },
      index: {
        store: createRedisStore('cache'),
      },
      captcha: {
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
  index: {
    login: {
      secret: 'desndex=ase$&e1#edad#$%%', //token加密平台标识
      expiresIn: 3600000 * 6, //token过期时间ms
      renewal: 60000 * 10, //续期时间ms
      cacheKey: 'index', //token使用的缓存key对应cacheManager.clients
    },
  },
  busboy: {
    mode: 'stream',
    // 扩展名白名单
    whitelist: uploadWhiteList,
    limits: {
      fileSize: 500 * 1024 * 1024, //上传限制 单位为byte
    },
    tmpdir: resolve(import.meta.dirname, '../../uploadFile/tmp'),
    upDir: resolve(import.meta.dirname, '../../uploadFile/'),
    cleanTimeout: 5 * 60 * 1000,
  },
  midwayLogger: {
    default: {
      transports: {
        file: {
          dir: resolve(import.meta.dirname, '../../logs'),
        },
        error: {
          dir: resolve(import.meta.dirname, '../../logs'),
        },
      },
    },
    // ...
  },
  bullmq: {
    defaultConnection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASS,
      db: process.env.REDIS_MQ ?? 1,
    },
    // 可选，队列前缀
    defaultPrefix: '[meadmin-bullmq]',
    clearRepeatJobWhenStart: false, //启动后不清除定时任务
  },
  // ...
} as MidwayConfig;
