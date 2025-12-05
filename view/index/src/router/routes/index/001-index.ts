import { RouteRecordRaw } from 'vue-router';
export const routes: RouteRecordRaw[] = [
  {
    path: 'index',
    component: () => import('@/views/index/index.vue'),
    meta: { title: '首页' },
  },
];
