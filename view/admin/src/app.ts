import '@/styles/index.scss';
import '@/event/module';
import { event, mitter } from './event';
import { App } from 'vue';
export let app: App;
import layoutMenuItem from '@/layout/components/menu/components/menuItem.vue';
export async function bootscrapt(appObj: App) {
  app = appObj;
  appObj.config.globalProperties.$start = true;
  await Promise.allSettled(mitter.emit(event.START, appObj));
  app.component('LayoutMenuItem', layoutMenuItem);

  //忽略resolveComponent can only be used in render() or setup().的警告
  appObj.config.warnHandler = (msg, instance, trace) => {
    if (msg !== 'resolveComponent can only be used in render() or setup().') {
      console.warn(`[Vue warn]: ${msg}`, instance, trace);
    }
  };
  mitter.emit(event.READY, appObj);
}
