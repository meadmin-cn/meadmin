import { concatObjectValue } from '@/utils/helper';
import { isExternal } from '@/utils/validate';
import path from 'path-browserify';
import type { Router, RouteRecordRaw } from 'vue-router';
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router';
export const asyncRoutes = concatObjectValue<RouteRecordRaw>(import.meta.glob('./routes/*.ts', { eager: true, import: 'routes' }));

// 业务路由基址与 Vite 静态资源 BASE_URL 分离；前台 CMS 规范地址从根路径开始。
export const routeBase = '/';
export const normalizeRouteUrl = (url: string) => url || '/';

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/page404',
    component: () => import('@/views/404.vue'),
    meta: { hideMenu: true, title: '404页面' },
  },
  {
    path: '/redirect/:path(.*)',
    component: async () => await import('@/views/redirect.vue'),
    meta: { hideMenu: true, title: '' },
  },
  {
    path: '/:pathMatch(.*)*',
    component: async () => await import('@/views/404.vue'),
    meta: { hideMenu: true, title: '404' },
  },
];

//路由地址转为绝对地址
export const resolvePath = (routePath: string, basePath = '') => {
  if (isExternal(routePath) || isExternal(basePath)) {
    return routePath;
  }
  return path.resolve(basePath, routePath);
};

//格式化路由
export const formatRoutes = (routes: RouteRecordRaw[], basePath = '', startIndex = 0) => {
  const newRoutes = [] as RouteRecordRaw[];
  routes.forEach((route, index) => {
    if (!route.meta) {
      route.meta = { title: '' };
    }
    route.meta.menuIndex = [index + startIndex];
    route.path = resolvePath(route.path, basePath);
    newRoutes.push(
      Object.assign(
        { ...route },
        {
          children: route.children ? formatRoutes(route.children, route.path, index + startIndex) : [],
        },
      ),
    );
  });
  return newRoutes;
};

export const jump = (route: Pick<RouteRecordRaw, 'path' | 'meta'>, router: Router) => {
  if (route.meta?.isLink) {
    window.open(route.path, '_blank');
  } else {
    router.push(route.path);
  }
};

/**
 *
 * @param app
 * @param addRoutes
 */
export function installRoute() {
  const router = createRouter({
    history: import.meta.env.SSR ? createMemoryHistory(routeBase) : createWebHistory(routeBase),
    routes: formatRoutes(constantRoutes),
  });
  return router;
}
