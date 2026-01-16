import { PageEnum } from '@/dict/pageEnum.js';
import Layout from '@/layout/default/index.vue';
import { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: PageEnum.USER,
    redirect: PageEnum.USER + '/userInfo',
    component: Layout,
    meta: {
      hideMenu: true,
      title: '用户中心',
    },

    children: [
      {
        path: ':active',
        component: async () => await import('@/views/user/index.vue'),
        props: true,
        meta: {
          hideMenu: true,
          title: '用户中心',
        },
      },
    ],
  },
];
