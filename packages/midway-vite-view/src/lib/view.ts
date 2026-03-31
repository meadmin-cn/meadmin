import { App, Config, Inject, Provide } from '@midwayjs/core';
import { Application, Context } from '@midwayjs/koa';
import { StaticFileOptions } from '@midwayjs/static-file';
import { IViewEngine } from '@midwayjs/view';
import * as fs from 'fs';
import * as path from 'path';
import { ViteViewConfig } from '../interface.js';
import { ViteService } from '../service/vite.service.js';
import { pathToFileURL } from 'url';
let ssrVersion = 0;
@Provide()
export class ViteView implements IViewEngine {
  @Config('staticFile')
  staticFileConfig: StaticFileOptions;

  @Config('viteView')
  viteViewConfig: ViteViewConfig;

  @App()
  app: Application;

  @Inject()
  ctx: Context;

  @Inject()
  vite: ViteService;

  private prodPath: string;
  private prod: boolean;

  async getSsrHtml(
    indexName: string,
    entryServerUrl: string,
    url: string,
    assign: object | undefined,
    name: string
  ) {
    try {
      let template,
        render,
        manifest = {};
      template = fs.readFileSync(indexName, 'utf-8');
      if (!this.prod) {
        // always read fresh template in dev
        const vite = await this.vite.createVite(name);
        template = await vite.transformIndexHtml(url, template);
        render = (
          await vite.ssrLoadModule(entryServerUrl, { fixStacktrace: true })
        ).render;
      } else {
        manifest = await import(
          pathToFileURL(path.resolve(this.prodPath, 'ssr-manifest.json')).href,
          { with: { type: 'json' } }
        );
        render = (await import(pathToFileURL(entryServerUrl).href)).render;
      }
      ssrVersion++;
      const context = {
        cookies: this.ctx.cookies,
        request: this.ctx.request,
        ssrVersion: '' + ssrVersion,
        assign: assign || {},
      };
      const [appHtml, preloadLinks, teleports] = await render(
        url,
        manifest,
        context
      );
      if (context['url']) {
        // Somewhere a `<Redirect>` was rendered
        return this.ctx.redirect(context['url']);
      }
      let html = template
        .replace('<!--preload-links-->', preloadLinks)
        .replace('<!--app-html-->', appHtml)
        .replace(/(\n|\r\n)\s*<!--app-teleports-->/, teleports)
        .replace('<html', '<html data-ssr="true"')
        .replace(
          /<!--ssr-no-content-start-->((?!((<!--ssr-no-content-start-->)|(<!--ssr-no-content-end-->))).)*<!--ssr-no-content-end-->/g,
          ''
        );
      if (assign) {
        for (const [key, value] of Object.entries(assign)) {
          html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
      }
      return html;
    } catch (e) {
      this.ctx.logger.error('服务端渲染失败，执行客户端渲染逻辑', e);
      return await this.getClientHtml(indexName, assign, url, name);
    }
  }

  async getClientHtml(
    indexName,
    assign: object | undefined,
    url: string,
    name: string
  ) {
    let html = fs
      .readFileSync(indexName, 'utf-8')
      .replace('<!--preload-links-->', '')
      .replace('<!--app-html-->', '');
    if (assign) {
      for (const [key, value] of Object.entries(assign)) {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }
    return this.prod
      ? html
      : await (await this.vite.createVite(name)).transformIndexHtml(url, html);
  }

  async render(
    namePath: string,
    locals: Record<string, any>,
    options: Record<string, any>
  ) {
    return (locals.ctx.body = await this.renderString(
      namePath,
      locals,
      options
    ));
  }

  async renderString(
    namePath: string,
    locals: Record<string, any>,
    options: Record<string, any>
  ) {
    let tpl = options.name;
    if (this.viteViewConfig.prod !== undefined) {
      this.prod = this.viteViewConfig.prod;
    } else {
      this.prod = ['prod', 'production'].includes(this.app.getEnv());
    }
    const entryInfo = this.viteViewConfig.views[options.name];
    let entrySsr = entryInfo.entryServer;
    if (this.prod) {
      this.prodPath =
        this.staticFileConfig.dirs[entryInfo.staticFileKey].dir + '/';
      tpl = path.resolve(this.prodPath, entryInfo.entry);
      entrySsr =
        locals.ssr !== false && entrySsr
          ? path
              .resolve(this.prodPath, 'ssr', entrySsr)
              .replace(/(\.[jt]sx)|(\.ts)$/, '.js')
          : '';
    } else {
      entrySsr =
        locals.ssr !== false && entrySsr
          ? path.resolve(namePath, entrySsr)
          : '';
      tpl = path.resolve(namePath, entryInfo.entry);
    }
    if (entrySsr) {
      return await this.getSsrHtml(
        tpl,
        entrySsr,
        locals.ctx.originalUrl,
        locals['assign'],
        options.name
      );
    }
    return await this.getClientHtml(
      tpl,
      locals['assign'],
      locals.ctx.originalUrl,
      options.name
    );
  }
}
