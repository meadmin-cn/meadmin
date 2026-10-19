import type { RouteRecordRaw } from 'vue-router';
const Layout = () => import('../views/components/layout.vue');
const Cms = () => import('../views/index.vue');
const Message = () => import('../views/message.vue');
export const routes: RouteRecordRaw[] = [
  {
    path: '/aon/cms',
    component: Layout,
    // CMS 各页面自行通过 layout 的 headerMenus 渲染站点菜单；
    // 该父路由若不加 hideMenu，会因无 meta.title 在框架默认页（/index）菜单里渲染成空白项。
    meta: { title: 'CMS', hideMenu: true },
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
