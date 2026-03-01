import { Pinia } from 'pinia';
import { App as AppType, createApp as createClientApp, createSSRApp } from 'vue';
import { Router } from 'vue-router';
import { bootscrapt } from './app';
import App from './App.vue';
import { router } from './router';
import { store } from './store';
// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
const addonsModules = import.meta.glob('./addons/*/module.js', {
  import: 'init',
  eager: true,
}) as Record<string, (app: AppType, router: Router, pinia: Pinia) => void>;

export async function createApp() {
  let app: AppType<Element>;
  if (import.meta.env.SSR || window?.document.querySelector('html')!.dataset.ssr === 'true') {
    app = createSSRApp(App);
  } else {
    app = createClientApp(App);
  }
  await bootscrapt(app);
  if (!import.meta.env.SSR && window.__pinia) {
    store.state.value = window.__pinia;
  }
  //遍历插件的初始化函数
  for (const key in addonsModules) {
    await addonsModules[key](app, router, store);
  }
  return { app, router, pinia: store };
}
