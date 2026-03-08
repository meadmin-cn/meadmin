import { RouteRecordRaw } from "vue-router";

const aonRoutes = import.meta.glob<RouteRecordRaw[]>('../../addons/*/router/index.ts', { eager: true, import: 'routes' });
export const routes: RouteRecordRaw[] = [];
Object.keys(aonRoutes).forEach(key=>{
  routes.push(...aonRoutes[key]);
})