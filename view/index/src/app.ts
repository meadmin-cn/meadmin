import '@/styles/index.scss';
import { event, mitter } from './event';
import { App } from 'vue';
import { installStore } from './store/index.js';
import { installRoute } from './router/index.js';
import { installIcon } from './icons/index.js';
import nProgress from 'nprogress';
export let app: App;
export async function bootscrapt(appObj: App) {
  app = appObj;
  app.config.globalProperties.$start = true;
  await installStore(app);
  installRoute(app);
  installIcon(app);
  if (!import.meta.env.SSR) {
    window.addEventListener('resize', () => mitter.emit(event.RESIZE));
    // 进度条配置
    nProgress.configure({
      showSpinner: false,
    });
  }
  await Promise.allSettled(mitter.emit(event.START, app));
  mitter.emit(event.READY, app);
}
