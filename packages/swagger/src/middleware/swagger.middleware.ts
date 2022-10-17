import { Config, IMiddleware, Init, Inject, Middleware } from '@midwayjs/core';
import {
  OpenAPIObject,
  OperationObject,
  SwaggerExplorer,
  TagObject,
} from '@midwayjs/swagger';
import { NextFunction, Context } from '@midwayjs/koa';
import {
  Knife4jServiceObject,
  MeSwaggerConfig,
  MeSwaggerConfigModule,
} from '../interfaces';
import { cloneDeep, forOwn } from 'lodash';
import { extname, join } from 'path';
import { readFileSync } from 'fs';

@Middleware()
export class SwaggerMiddleware implements IMiddleware<Context, NextFunction> {
  @Config('meSwagger')
  meSwaggerConfig: MeSwaggerConfig;

  @Inject()
  private swaggerExplorer: SwaggerExplorer;

  private moduleDatas = {} as Record<string, OpenAPIObject>;

  private swaggerViewPath: string;

  private services = [] as Knife4jServiceObject[];

  @Init()
  init() {
    this.swaggerViewPath = join(__dirname, '../../view/dist/');
    forOwn(
      this.meSwaggerConfig.module,
      (module: MeSwaggerConfigModule, key: string) => {
        this.services.push({
          name: module.name,
          url: key + '.json',
          swaggerVersion: '3.0',
          location: key + '.json',
        });
      }
    );
  }

  getModuleData(module: string) {
    if (!this.moduleDatas[module]) {
      const config = this.meSwaggerConfig.module[module];
      if (!config) {
        return {};
      }
      const swaggerData = cloneDeep(
        this.swaggerExplorer.getData()
      ) as OpenAPIObject;
      const tags = new Set<TagObject>();
      const paths = swaggerData.paths;
      swaggerData.paths = {};
      const tagObject = {} as Record<string, TagObject>;
      swaggerData.tags.forEach(tag => {
        if (!tagObject[tag.name]) {
          tagObject[tag.name] = tag;
        }
      });
      forOwn(paths, (item: OperationObject, path: string) => {
        if (config.pathRule(path)) {
          swaggerData.paths[path] = item;
          [
            'get',
            'put',
            'post',
            'delete',
            'options',
            'head',
            'patch',
            'trace',
          ].forEach(i => {
            if (item[i] && item[i].tags) {
              item[i].tags.forEach((tag: string) => tags.add(tagObject[tag]));
            }
          });
        }
      });
      swaggerData.tags = [...tags];
      swaggerData.info = Object.assign(swaggerData.info, config.info);
      swaggerData.servers = config.servers ?? swaggerData.servers;
      swaggerData.externalDocs = Object.assign(
        swaggerData.externalDocs ?? {},
        config.externalDocs
      );
      this.moduleDatas[module] = swaggerData;
    }
    return this.moduleDatas[module];
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const pathname = ctx.path;
      if (pathname.indexOf(this.meSwaggerConfig.prefix) === -1) {
        return await next();
      }
      const name = pathname.replace(this.meSwaggerConfig.prefix, '');
      if (name === 'me-swagger-api-services') {
        ctx.body = this.services;
        return;
      }
      if (name.endsWith('.json')) {
        ctx.body = this.getModuleData(name.slice(0, -5));
        return;
      }
      let content = '';

      if (name.endsWith('index.html')) {
        content = this.replaceInfo(
          readFileSync(join(this.swaggerViewPath, name), {
            encoding: 'utf-8',
          })
        );
      } else {
        // if (ctx.get('Accept-Encoding').includes('gzip')) {
        //   ctx.set('Content-Encoding', 'gzip');
        //   content =  existsSync(join(this.swaggerViewPath, name + '.gz'))? readFileSync(join(this.swaggerViewPath, name + '.gz'), {
        //     encoding: 'utf-8',
        //   }):readFileSync(join(this.swaggerViewPath, name), {
        //     encoding: 'utf-8',
        //   })
        // } else {
        content = readFileSync(join(this.swaggerViewPath, name), {
          encoding: 'utf-8',
        });
        // }
        const ext = extname(name);
        if (ext === '.js') {
          ctx.set('Content-Type', 'application/javascript');
        } else if (ext === '.map') {
          ctx.set('Content-Type', 'application/json');
        } else if (ext === '.css') {
          ctx.set('Content-Type', 'text/css');
        } else if (ext === '.png') {
          ctx.set('Content-Type', 'image/png');
        }
      }
      ctx.body = content;
    };
  }

  replaceInfo(content: string): string {
    return content
      .replace('{{title}}', 'swagger')
      .replace(
        "window.base_url = 'http://localhost:7001/'",
        `window.base_url = "${this.meSwaggerConfig.prefix}"`
      );
  }

  static getName() {
    return 'meSwagger';
  }
}
