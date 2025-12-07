import { App } from 'vue';
import { useUserStore } from './module';
export * from './module';
export const store = createPinia();
export async function installStore(app: App) {
  console.log('--Pinia--start--222')
  app.use(store);
  await useUserStore().init();
  console.log('1111--Pinia--');
}
