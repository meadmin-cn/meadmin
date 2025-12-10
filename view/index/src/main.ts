import { createSSRApp, createApp as createClientApp, App as AppType } from 'vue';
import App from './App.vue';
import { router } from './router';
import { store } from './store';
import { bootscrapt } from './app';
import { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus';
// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
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
  app.provide(ID_INJECTION_KEY, {
    prefix: 1024,
    current: 0,
  });
  app.provide(ZINDEX_INJECTION_KEY, { current: 0 });
  return { app, router, pinia: store };
}
