import { router, constantRoutes, asyncRoutes, formatRoutes } from '@/router';
import { RouteRecordRaw } from 'vue-router';
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
      return  this.addRoutes = asyncRoutes;
    },
    //初始化路由
    initRoutes() {
      formatRoutes(this.generateRoutes()).forEach((route) => router.addRoute(route));
    }
  },
});
