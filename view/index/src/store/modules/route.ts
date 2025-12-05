import { router, constantRoutes, asyncRoutes, flatteningRoutes2 } from '@/router';
import { RouteRecordRaw } from 'vue-router';
export default defineStore('route', {
  state: () => ({
    addRoutes: [] as RouteRecordRaw[],
    cacheFullPath: new Set() as Set<string | RegExp>,
    childsRoutes: [] as RouteRecordRaw[][],
  }),
  getters: {
    routes: (state) => constantRoutes.concat(state.addRoutes),
  },
  actions: {
    //生成动态路由
    generateRoutes() {
      return  this.addRoutes = asyncRoutes;
    },
    //初始化路由
    initRoutes() {
      flatteningRoutes2(this.generateRoutes()).forEach((route) => router.addRoute(route));
    }
  },
});
