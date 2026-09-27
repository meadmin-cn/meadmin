import type { RouteRecordRaw } from 'vue-router';
const Layout = () => import('../views/components/layout.vue');
const Cms = () => import('../views/index.vue');
const Download = () => import('../views/download.vue');
const DownloadDetail = () => import('../views/downloadDetail.vue');
const Message = () => import('../views/message.vue');
export const routes: RouteRecordRaw[] = [
  {
    path: '/aon/cms',
    component: Layout,
    children: [
      {
        path: '',
        component: Cms,
        meta: { title: 'CMS', hideMenu: true },
      },
      {
        path: 'category/:slug',
        name: 'cms-category',
        component: Cms,
        meta: { title: 'CMS', hideMenu: true },
      },
      { path: 'download', name: 'cms-download', component: Download, meta: { title: '下载中心', hideMenu: true, fullWidth: true } },
      { path: 'download/:slug', name: 'cms-download-detail', component: DownloadDetail, meta: { title: '下载详情', hideMenu: true } },
      { path: 'message', name: 'cms-message', component: Message, meta: { title: '留言板', hideMenu: true } },
      {
        path: ':kind(article|page|topic)/:slug',
        component: Cms,
        meta: { title: 'CMS', hideMenu: true },
      },
    ],
  },
];
