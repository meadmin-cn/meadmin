import type { RouteRecordRaw } from 'vue-router';
import Layout from '../views/components/layout.vue';
import Doc from '../views/doc.vue';
export const routes: RouteRecordRaw[] = [
  {
    path: '/aon/doc',
    redirect: '/aon/doc/index',
    component: Layout,
    children: [
      {
        path: ':version/:aonDocLabel',
        component: Doc,
        meta: { hideMenu: true, title: '' },
        props: true,
      },
      {
        path: ':version/',
        component: Doc,
        meta: { hideMenu: true, title: '' },
        props: true,
      },
      {
        path: 'index',
        component: Doc,
        meta: { title: '文档' },
      },
    ],
  },
];
