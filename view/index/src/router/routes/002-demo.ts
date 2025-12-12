import { PageEnum } from '@/dict/pageEnum';
import { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/default/index.vue';
import LayoutRoute from '@/layout/layoutRoute.vue';
import { concatObjectValue } from '@/utils/helper';
export const routes: RouteRecordRaw[] = [
  {
    path:'/demo',
    redirect: '/demo/1',
    component: Layout,
    children: concatObjectValue<RouteRecordRaw>(
          import.meta.glob('./demo/*.ts', { eager: true, import: 'routes' }),
    ),
    meta: { title: '演示菜单' },
  },
];
