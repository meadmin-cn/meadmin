import { createSSRApp,createApp as createClientApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { store } from './store';
import {bootscrapt} from './app';
// SSR requires a fresh app instance per request, therefore we export a function
// that creates a fresh app instance. If using Vuex, we'd also be creating a
// fresh store here.
export async function createApp() {
  const app = (typeof window!=='undefined' && window.document.querySelector('html')!.dataset.ssr==='true')?createSSRApp(App):createClientApp(App);
  await bootscrapt(app);
  if (!import.meta.env.SSR && window.__pinia) {
    store.state.value = window.__pinia;
  }
  return { app, router, pinia:store };
}
