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
      // 首页直接挂在 /aon/cms（不再用 /aon/cms/index），这样头部「首页」菜单和站点根路径都指向同一个地址
      {
        path: '',
        name: 'cms-index',
        component: Cms,
        meta: { title: 'CMS', hideMenu: true },
      },
      // 旧地址兼容：/aon/cms/index 跳回 /aon/cms
      // 站点域名映射时这条重定向只保留 /index 这个次级别名，根路径 `/` 由上面的首页路由独占（见 router/site.ts）
      {
        path: 'index',
        redirect: '/aon/cms',
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
      // 内容详情显式声明 article/page/topic 三条字面量路由：
      // 伪静态规则（如 /article/:slug）需要作为 alias 挂到具体路由上，
      // 而带约束的 :kind 参数段无法被 alias 覆盖，因此保留原路由仅做旧地址兼容。
      { path: 'article/:slug', component: Cms, meta: { title: 'CMS', hideMenu: true, cmsKind: 'article' } },
      { path: 'page/:slug', component: Cms, meta: { title: 'CMS', hideMenu: true, cmsKind: 'page' } },
      { path: 'topic/:slug', component: Cms, meta: { title: 'CMS', hideMenu: true, cmsKind: 'topic' } },
      {
        path: ':kind(article|page|topic)/:slug',
        component: Cms,
        meta: { title: 'CMS', hideMenu: true },
      },
    ],
  },
];
