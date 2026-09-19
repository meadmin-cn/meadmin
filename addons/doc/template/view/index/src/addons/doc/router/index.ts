import type { RouteRecordRaw } from 'vue-router';
const Layout = () => import('../views/components/layout.vue');
const Doc = () => import('../views/doc.vue');
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
