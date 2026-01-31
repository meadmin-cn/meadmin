declare module 'vue-router' {
  export interface RouteMeta extends Record<string | number | symbol, unknown> {
    // 标题设置该路由在侧边栏和面包屑中展示的名字
    title: string;
    // 外链
    isLink?: boolean;
    //需要登录才能访问
    needLogin?: boolean;
    //菜单不展示
    hideMenu?: boolean;
  }
  export interface _RouteRecordBase {
    // 没有需要展示的子集（会动态计算不要设置默认值）
    noShowingChildren?: boolean;
  }
}
export {};
