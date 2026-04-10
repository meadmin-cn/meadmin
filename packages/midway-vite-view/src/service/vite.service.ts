import {
  ILogger
} from '@midwayjs/core';
import {
  App,
  Config,
  Logger,
  Provide,
  Scope,
  ScopeEnum,
  sleep,
} from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import c2k from 'koa-connect';
import { existsSync, mkdirSync } from 'node:fs';
import * as path from 'node:path';
import { ViteDevServer } from 'vite';
import { createServer, normalizePath } from 'vite';
import { ViteViewConfig } from '../interface.js';

const cachePostfix = '_';
const vitePlugin = (
  name: string,
  viewRoot: string,
  appDir: string,
  hmrPort: number
) => ({
  name: 'vite-plugin-midway-vite-view',
  async config(config: any) {
    if (!config.server.hmr) {
      const port = hmrPort;
      config.server.hmr = {
        clientPort: port,
        port: port,
      };
    }
    if (!config.cacheDir) {
      config.cacheDir = path.resolve(
        appDir,
        `node_modules/.vite${cachePostfix}${name}`
      );
      // cachePostfix = cachePostfix + '_';
    }
    if (!config.base) {
      if (!config.root) {
        throw new Error('vite config 中必须配置正确的base或root参数');
      }
      config.base = normalizePath(
        '/' +
          path.relative(viewRoot, path.resolve(process.cwd(), config.root)) +
          '/'
      );
    }
  },
});

export type MiddlewareArr = { middleware: any; prefix: string }[];

@Provide()
@Scope(ScopeEnum.Singleton)
export class ViteService {
  @Config('viteView')
  viteViewConfig: ViteViewConfig;

  @App()
  koaApp: koa.Application;

  @Logger('coreLogger')
  logger: ILogger;

  private vite = {} as { [key: string]: ViteDevServer };
  private middlewareArr = [] as MiddlewareArr;
  private inited = 'not' as 'not' | 'processing' | 'success';
  //生成vite server
  async createVite(name: string) {
    if (!this.vite[name]) {
      const configFile = path.resolve(
        this.koaApp.getAppDir(),
        this.viteViewConfig.rootDir,
        name,
        this.viteViewConfig.views[name].viteConfigFile
      );
      const hmrPort = this.viteViewConfig.views[name].hmrPort;
      this.vite[name] = await createServer({
        configFile,
        appType: 'custom',
        plugins: [
          vitePlugin(
            name,
            this.viteViewConfig.rootDir,
            this.koaApp.getAppDir(),
            hmrPort
          ),
        ],
        server: {
          middlewareMode: true,
          watch: {
            // During tests we edit the files too fast and sometimes chokidar
            // misses change events, so enforce polling for consistency
            usePolling: true,
            interval: 100,
          },
        },
      });
    }
    return this.vite[name];
  }

  getMiddlewareIndex(prefix: string) {
    for (let i = 0; i < this.middlewareArr.length; i++) {
      if (this.middlewareArr[i].prefix.length <= prefix.length) {
        return i;
      }
    }
    return 0;
  }

  //获取全部vite中间件数组
  async getViteMiddlewareArr():Promise<MiddlewareArr> {
    if (this.inited === 'success') {
      return this.middlewareArr;
    }
    if (this.inited === 'processing') {
      await sleep(500);
      return await this.getViteMiddlewareArr();
    }
    try {
      this.inited = 'processing';
      const configSet = new Set<string | undefined>();
      const promiseArr = [] as Promise<unknown>[];
      const start = +new Date();
      for (const [name, view] of Object.entries(this.viteViewConfig.views)) {
        promiseArr.push(
          (async () => {
            this.logger.info(` ${name} vite server开始创建`);

            const viteServer = await this.createVite(name);
            this.middlewareArr.splice(
              this.getMiddlewareIndex(viteServer.config.base),
              0,
              {
                middleware: c2k(viteServer.middlewares),
                prefix: viteServer.config.base,
              }
            );
            configSet.add(view.viteConfigFile);
            this.logger.info(` ${name} vite server 创建 完成`);
          })()
        );
      }
      await Promise.all(promiseArr);
      this.logger.info(`vite server 全部创建完成,耗时${+new Date() - start}ms`);
      this.inited = 'success';
      return this.middlewareArr;
    } catch (e) {
      this.inited = 'not';
      throw e;
    }
  }

  closeAll() {
    for (const [, server] of Object.entries(this.vite)) {
      server.close();
    }
    this.vite = {};
    this.middlewareArr.splice(0, this.middlewareArr.length);
  }

  //获取catch文件地址
  getCatchFile() {
    let catchPath = path.resolve(process.cwd(), 'node_modules/');
    if (!existsSync(catchPath)) {
      mkdirSync(catchPath);
    }
    catchPath = path.resolve(catchPath, '.meadmin/'); //meadmin缓存文件夹
    if (!existsSync(catchPath)) {
      mkdirSync(catchPath);
    }
    catchPath = path.resolve(catchPath, 'temp/'); //临时缓存关闭后清除
    if (!existsSync(catchPath)) {
      mkdirSync(catchPath);
    }
    return path.resolve(catchPath, 'midway_vite_view_port.json');
  }
}
