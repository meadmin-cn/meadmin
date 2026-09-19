type ElementIconComponents = {
  [Name in keyof typeof import('@element-plus/icons-vue') as `MelIcon${Name}`]: Icon;
};
declare module 'vue' {
  export interface GlobalComponents extends ElementIconComponents {
    LayoutMenuItem: (typeof import('../src/layout/components/menu/components/menuItem.vue'))['default'];
  }
}
import { StateTree } from 'pinia';
declare global {
  interface Window {
    __pinia?: Record<string, StateTree>;
  }
  type TestIndex = number;
}
export {};
