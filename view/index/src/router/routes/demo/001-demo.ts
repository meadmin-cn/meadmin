import { RouteRecordRaw } from 'vue-router';
import LayoutRoute from '@/layout/layoutRoute.vue';
export const routes: RouteRecordRaw[] = [
  {
    path: '1',
    component: () => import('@/views/index/index.vue'),
    meta: { title: '演示菜单1' },
  },
  {
    path: '2',
    meta: { title: '演示菜单2' },
    component: LayoutRoute,
    children: [
      {
        path: '2-2',
        component: () => import('@/views/index/index.vue'),
        meta: { title: '演示菜2-1' },
      },
      {
        path: '2-2',
        component: () => import('@/views/index/index.vue'),
        meta: { title: '演示菜2-2' },
      },
    ]
  },
  {
    path: '3',
    component: () => import('@/views/index/index.vue'),
    meta: { title: '演示菜3' },
  },
  {
    path: '4',
    component: () => import('@/views/index/index.vue'),
    meta: { title: '演示菜单4' },
  },
];
