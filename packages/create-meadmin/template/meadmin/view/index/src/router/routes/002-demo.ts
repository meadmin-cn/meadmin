import Layout from '@/layout/default/index.vue';
import { concatObjectValue } from '@/utils/helper';
import type { RouteRecordRaw } from 'vue-router';
export const routes: RouteRecordRaw[] = [
  {
    path: '/demo',
    redirect: '/demo/1',
    component: Layout,
    children: concatObjectValue<RouteRecordRaw>(import.meta.glob('./demo/*.ts', { eager: true, import: 'routes' })),
    meta: { title: '演示菜单' },
  },
];
