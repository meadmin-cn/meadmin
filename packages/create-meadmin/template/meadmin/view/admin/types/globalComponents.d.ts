declare module 'vue' {
  export interface GlobalComponents {
    LayoutMenuItem: typeof import('../src/layout/components/menu/components/menuItem.vue')['default'];
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
