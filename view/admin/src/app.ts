import '@/styles/index.scss';
import '@/event/module';
import { event, mitter } from './event';
import { App } from 'vue';
export let app: App;
import layoutMenuItem from '@/layout/components/menu/components/menuItem.vue';
export async function bootscrapt(appObj: App) {
  app = appObj;
  app.config.globalProperties.$start = true;
  await Promise.allSettled(mitter.emit(event.START, app));
  app.component('LayoutMenuItem', layoutMenuItem);
  mitter.emit(event.READY, app);
}
