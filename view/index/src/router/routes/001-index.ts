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
        props: { type: 'login' },
        meta: {
          hideMenu: true,
          title: '登录',
        },
      },
      {
        path: PageEnum.REGISTER,
        component: async () => await import('@/views/login/index.vue'),
        props: { type: 'register' },
        meta: {
          hideMenu: true,
          title: '注册',
        },
      },
      {
        path: 'index',
        component: () => import('@/views/index/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'promiseError/:msg',
        component: () => import('@/views/promiseError.vue'),
        meta: { title: '无权限访问！', hideMenu: true },
        props: true,
      },
    ],
    meta: { title: '首页' },
  },
];
