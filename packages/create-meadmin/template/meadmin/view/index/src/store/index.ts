import { App } from 'vue';
import { useUserStore } from './module';
export * from './module';
export const storeKey = Symbol('store');
export async function installStore(app: App) {
  const store = createPinia();
  app.use(store);
  app.provide(storeKey, store);
  await useUserStore(store).init(app);
  return store;
}
