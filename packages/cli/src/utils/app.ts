import { IMidwayFramework } from '@midwayjs/core';
import { Application, Framework } from '@midwayjs/koa';
import { close, createApp } from '@midwayjs/mock';

let app: Application;
export async function getApp<T extends IMidwayFramework<any, any, any, any, any> = Framework>(args?: Parameters<typeof createApp<T>>) {
  // create app
  return (app = await createApp<T>(...(args ?? [])));
}

export function closeApp() {
  if (app) {
    return close(app);
  }
}
