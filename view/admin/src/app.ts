import '@/event/module';
import layoutMenuItem from '@/layout/components/menu/components/menuItem.vue';
import '@/styles/index.scss';
import type { App } from 'vue';
import { event, mitter } from './event';
export let app: App;
export async function bootscrapt(appObj: App) {
  app = appObj;
  app.config.globalProperties.$start = true;
  await Promise.allSettled(mitter.emit(event.START, app));
  app.component('LayoutMenuItem', layoutMenuItem);
  mitter.emit(event.READY, app);
}
