import { RouteRecordRaw } from 'vue-router';
import Doc from '../views/doc.vue';

export const routes: RouteRecordRaw[] = [
  {
    path: '/aon/doc/:version/:aonDocLabel',
    component: Doc,
    meta: { hideMenu: true, title: '' },
    props: true,
  },
  {
    path: '/aon/doc/:version/',
    component: Doc,
    meta: { hideMenu: true, title: '' },
    props: true,
  },
  {
    path: '/aon/doc',
    component: Doc,
    meta: { title: '文档' },
  },
];
