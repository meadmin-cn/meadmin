import { asyncRoutes, constantRoutes, formatRoutes } from '@/router';
import { applySiteAliases, prioritizeSiteRoutes, readSiteConfig } from '@/router/site';
import { cloneDeep } from 'lodash-es';
import type { Router, RouteRecordRaw } from 'vue-router';
export default defineStore('route', {
  state: () => ({
    addRoutes: [] as RouteRecordRaw[],
  }),
  getters: {
    routes: (state) => constantRoutes.concat(state.addRoutes),
  },
  actions: {
    //生成动态路由
    generateRoutes() {
      const routes = cloneDeep(asyncRoutes);
      // 站点伪静态通过 Vue Router alias 实现：地址栏保持 pattern，页面渲染 target。
      applySiteAliases(routes, readSiteConfig());
      return (this.addRoutes = routes);
    },
    //初始化路由
    initRoutes(router: Router) {
      // 站点路由优先注册，保证 `/` 等别名不被框架默认路由抢占。
      prioritizeSiteRoutes(formatRoutes(this.generateRoutes())).forEach((route) => router.addRoute(route));
    },
  },
});
