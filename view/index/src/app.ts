import '@/styles/index.scss';
import '@/event/module';
import { event, mitter } from './event';
import { App } from 'vue';
export let app: App;
export async function bootscrapt(appObj: App) {
  app = appObj;
  app.config.globalProperties.$start = true;
  await Promise.allSettled(mitter.emit(event.START, app));
  mitter.emit(event.READY, app);
}
