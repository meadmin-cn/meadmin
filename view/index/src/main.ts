// organize-imports-ignore
import { App as AppType, createApp as createClientApp, createSSRApp } from 'vue';
import { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus';
import { bootscrapt } from './app';
import App from './App.vue';
import { Router } from 'vue-router';
import { Pinia } from 'pinia';

// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
const addonsModules = import.meta.glob('./addons/*/module.js', {
  import: 'init',
  eager: true,
}) as Record<string, (app: AppType, router: Router, pinia: Pinia) => void>;

/**
 *
 * @param ssrVersion 服务端渲染Version用以区分缓存防止‘跨请求状态污染’，客户端固定为''
 * @returns
 */
export async function createApp(ssrVersion = '') {
  let app: AppType<Element>;
  if (import.meta.env.SSR || window?.document?.querySelector('html')!.dataset.ssr === 'true') {
    app = createSSRApp(App);
  } else {
    app = createClientApp(App);
  }
  app.provide(ID_INJECTION_KEY, {
    prefix: 1024,
    current: 0,
  });
  app.provide(ZINDEX_INJECTION_KEY, { current: 0 });
  const res = await bootscrapt(app, ssrVersion);
  //遍历插件的初始化函数
  for (const key in addonsModules) {
    await addonsModules[key](res.app, res.router, res.store);
  }
  return res;
}
