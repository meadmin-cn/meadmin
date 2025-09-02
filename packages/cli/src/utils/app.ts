import { createApp, close } from '@midwayjs/mock';
import { Framework, Application } from '@midwayjs/koa';
import { IMidwayFramework } from '@midwayjs/core';

let app:Application;
export async function getApp<T extends IMidwayFramework<any, any, any, any, any> = Framework>(args?:Parameters<typeof createApp<T>>) {
  // create app
  return app = await createApp<T>(...args);
}

export function closeApp(){
  if(app){
    close(app);
  }
} 