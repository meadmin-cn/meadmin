import '@/styles/index.scss';
import '@/event/module';
import { event, mitter } from './event';
import layoutMenuItem from '@/layout/components/menu/components/menuItem.vue';
export async function bootscrapt(app) {
  app.config.globalProperties.$start = true;
  app.component('LayoutMenuItem', layoutMenuItem);
  await Promise.allSettled(mitter.emit(event.START, app));
  //忽略resolveComponent can only be used in render() or setup().的警告
  app.config.warnHandler = (msg, instance, trace) => {
    if (msg !== 'resolveComponent can only be used in render() or setup().') {
      console.warn(`[Vue warn]: ${msg}`, instance, trace);
    }
  };
  mitter.emit(event.READY, app);
}
