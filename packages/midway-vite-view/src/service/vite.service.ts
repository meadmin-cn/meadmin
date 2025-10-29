import { ViteViewConfig } from '../interface.js';
import {
  Config,
  Provide,
  Scope,
  ScopeEnum,
  App,
  MidwayConfig,
} from '@midwayjs/core';
import { createServer, ViteDevServer, normalizePath, HmrOptions } from 'vite';
import { getPort } from '../utils/index.js';
import c2k from 'koa2-connect';
import * as path from 'node:path';
import * as koa from '@midwayjs/koa';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

let cachePostfix = '';
const vitePlugin = (viewRoot: string, appDir: string) => ({
  name: 'vite-plugin-midway-vite-view',
  async config(config: any) {
    if (!config.server.hmr) {
      const port = await getPort(24678);
      config.server.hmr = {
        clientPort: port,
        port: port,
      };
    }
    if (!config.cacheDir) {
      config.cacheDir = path.resolve(
        appDir,
        `node_modules/.vite${cachePostfix}`
      );
      cachePostfix = cachePostfix + '_';
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

  @Config('view')
  viewConfig: MidwayConfig['view'];

  @App()
  koaApp: koa.Application;

  private vite = {} as { [key: string]: ViteDevServer };
  private middlewareArr = [] as MiddlewareArr;
  //生成vite server
  async createVite(configFile: string, hmr?: HmrOptions | boolean) {
    if (!this.vite[configFile]) {
      this.vite[configFile] = await createServer({
        configFile,
        appType: 'custom',
        plugins: [
          vitePlugin(this.viewConfig.rootDir.default, this.koaApp.getAppDir()),
        ],
        server: {
          middlewareMode: true,
          watch: {
            // During tests we edit the files too fast and sometimes chokidar
            // misses change events, so enforce polling for consistency
            usePolling: true,
            interval: 100,
          },
          hmr:hmr
        },
      });
    }
    return this.vite[configFile];
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
  async getViteMiddlewareArr() {
    if (this.middlewareArr.length) {
      return this.middlewareArr;
    }
    const configSet = new Set<string | undefined>();
    for (const [, view] of Object.entries(this.viteViewConfig.views)) {
      if (typeof view === 'object' && !configSet.has(view.viteConfigFile)) {
        const viteServer = await this.createVite(view.viteConfigFile);
        this.middlewareArr.splice(
          this.getMiddlewareIndex(viteServer.config.base),
          0,
          {
            middleware: c2k(viteServer.middlewares),
            prefix: viteServer.config.base,
          }
        );
        configSet.add(view.viteConfigFile);
      } else if (!configSet.has(undefined)) {
        const viteServer = await this.createVite(
          this.viteViewConfig.viteConfigFile
        );
        this.middlewareArr.splice(
          this.getMiddlewareIndex(viteServer.config.base),
          0,
          {
            middleware: c2k(viteServer.middlewares),
            prefix: viteServer.config.base,
          }
        );
        configSet.add(undefined);
      }
    }
    return this.middlewareArr;
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

  //缓存vite地址
  catchViteAddress() {
    const catchPath = this.getCatchFile();
    const json = {};
    Object.keys(this.vite).forEach(key => {
      json[key] = {
        time: new Date(),
        hmr: this.vite[key].config.server.hmr
      };
    });
    writeFileSync(catchPath, JSON.stringify(json), 'utf8');
  }

  //恢复缓存的vite
  restoreVite() {
    const catchPath = this.getCatchFile();
    if (existsSync(catchPath)) {
      const json = JSON.parse(readFileSync(catchPath, 'utf8'));
      json && Object.keys(json).forEach(key => {
        this.createVite(key,json[key].hmr);
      });
    }
  }
}
