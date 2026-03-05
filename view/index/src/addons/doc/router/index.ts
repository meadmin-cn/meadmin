import Layout from '@/layout/default/index.vue';
import { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/aon/doc/:aonDocTYpe/:aonDocLabel',
    component: Layout,
  },
];
