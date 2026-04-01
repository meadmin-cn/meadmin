import '@/styles/index.scss';
import nProgress from 'nprogress';
import { App } from 'vue';
import { initVxeTable } from './components/meVxeTable/install.js';
import { event, mitter } from './event';
import { installIcon } from './icons/index.js';
import { setupRouterGuard } from './router/guard/index.js';
import { installRoute } from './router/index.js';
import { installStore } from './store/index.js';
import { setApp } from './utils/request.js';
export const ssrVersionKey = Symbol('ssrVersionKey');
export async function bootscrapt(app: App, ssrVersion: string = '') {
  app.config.globalProperties.$start = true;
  if (import.meta.env.SSR) {
    app.config.globalProperties.$ssrVersion = ssrVersion;
  } else {
    app.config.globalProperties.$ssrVersion = window.__ssrVersion ?? '';
  }
  app.provide(ssrVersionKey, app.config.globalProperties.$ssrVersion);
  const router = installRoute();
  app.config.globalProperties.$router = router;
  const store = await installStore(app);
  app.use(router);
  setApp(app);
  setupRouterGuard(router, store);
  initVxeTable(app);
  installIcon(app);
  if (!import.meta.env.SSR) {
    window.addEventListener('resize', () => mitter.emit(event.RESIZE));
    // 进度条配置
    nProgress.configure({
      showSpinner: false,
    });
    if (window.__pinia) {
      store.state.value = window.__pinia;
    }
  }
  await Promise.allSettled(mitter.emit(event.START, app));
  mitter.emit(event.READY, app);
  return { router, store, app };
}
