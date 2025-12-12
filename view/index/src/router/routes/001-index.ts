import { PageEnum } from '@/dict/pageEnum';
import { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/default/index.vue';
export const routes: RouteRecordRaw[] = [
  {
    path: PageEnum.HOME,
    redirect: PageEnum.HOME + 'index',
    component: Layout,
    children: [
      {
        path: PageEnum.LOGIN,
        component: async () => await import('@/views/login/index.vue'),
        meta: {
          hideMenu: true,
          title: '登录',
        },
      },
      {
        path: 'index',
        component: () => import('@/views/index/index.vue'),
        meta: { title: '首页' },
      },
    ],
    meta: { title: '首页' },
  },
];
