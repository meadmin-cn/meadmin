import { asyncRoutes, constantRoutes, formatRoutes } from '@/router';
import { cloneDeep } from 'lodash-es';
import { Router, RouteRecordRaw } from 'vue-router';
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
      return (this.addRoutes = cloneDeep(asyncRoutes));
    },
    //初始化路由
    initRoutes(router: Router) {
      formatRoutes(this.generateRoutes()).forEach((route) => router.addRoute(route));
    },
  },
});
