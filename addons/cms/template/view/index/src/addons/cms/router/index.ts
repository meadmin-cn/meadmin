import type { RouteRecordRaw } from 'vue-router';
const Layout = () => import('../views/components/layout.vue');
const Cms = () => import('../views/index.vue');
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
      {
        path: 'tag/:slug',
        name: 'cms-tag',
        component: Cms,
        meta: { title: 'CMS', hideMenu: true },
      },
      // 自定义表单独立访问页：表单标识由后台「自定义表单」配置，页面内容与留言板共用一套渲染
      { path: 'form/:diyname', name: 'cms-diyform', component: Message, meta: { title: '表单', hideMenu: true } },
      {
        path: ':kind(article|page|topic)/:slug',
        component: Cms,
        meta: { title: 'CMS', hideMenu: true },
      },
    ],
  },
];
