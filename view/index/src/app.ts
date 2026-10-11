import '@/styles/index.scss';
import nProgress from 'nprogress';
import type { App } from 'vue';
import { initVxeTable } from './components/meVxeTable/install.js';
import { event, mitter } from './event';
import { installIcon } from './icons/index.js';
import { setupRouterGuard } from './router/guard/index.js';
import { installRoute } from './router/index.js';
import { installStore } from './store/index.js';
import { setApp } from './utils/request.js';
export const ssrVersionKey = Symbol('ssrVersionKey');
export async function bootscrapt(app: App, ssrVersion: string = '') {
  // 全局错误兜底：组件生命周期（含 Element Plus 轮播等第三方组件在卸载时的清理竞态）
  // 抛出的错误不应冒泡为未捕获异常而中断路由过渡 / 整页白屏，仅记录即可。
  app.config.errorHandler = (err, _instance, info) => {
    console.error('[vue error]', err, info);
  };
  app.config.warnHandler = (msg, _instance, _trace) => {
    // 过滤掉与第三方组件无关的噪音告警，保留真实问题
    if (/findComponent |Extraneous non-emits/.test(msg)) return;
    console.warn('[vue warn]', msg, _instance, _trace);
  };
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
  installIcon(app);
  initVxeTable(app);
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
