import { App, Config, Provide, Scope, ScopeEnum } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import c2k from 'koa2-connect';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { createServer, HmrOptions, normalizePath, ViteDevServer } from 'vite';
import { ViteViewConfig } from '../interface.js';
import { getPort } from '../utils/index.js';

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
      const port = await getPort(hmrPort);
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

  private vite = {} as { [key: string]: ViteDevServer };
  private middlewareArr = [] as MiddlewareArr;
  //生成vite server
  async createVite(name: string, hmr?: HmrOptions | boolean) {
    if (!this.vite[name]) {
      let configFile = path.resolve(
        this.koaApp.getAppDir(),
        this.viteViewConfig.rootDir,
        name,
        this.viteViewConfig.views[name].viteConfigFile
      );
      if (typeof hmr === 'object') {
        hmr.port = await getPort(hmr.port);
      }
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
          hmr: hmr,
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
  async getViteMiddlewareArr() {
    if (this.middlewareArr.length) {
      return this.middlewareArr;
    }
    const configSet = new Set<string | undefined>();
    for (const [name, view] of Object.entries(this.viteViewConfig.views)) {
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
        hmr: this.vite[key].config.server.hmr,
      };
    });
    writeFileSync(catchPath, JSON.stringify(json), 'utf8');
  }

  //恢复缓存的vite
  restoreVite() {
    const catchPath = this.getCatchFile();
    if (existsSync(catchPath)) {
      const json = JSON.parse(readFileSync(catchPath, 'utf8'));
      json &&
        Object.keys(json).forEach(key => {
          this.createVite(key, json[key].hmr);
        });
    }
  }
}
