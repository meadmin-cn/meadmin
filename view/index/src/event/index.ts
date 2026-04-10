/**
 * 事件总线
 */
import EventEnum from '@/dict/eventEnmu';
import Mitt from '@/utils/mitt';
import type { App } from 'vue';
import type { NavigationFailure, RouteLocationNormalized } from 'vue-router';
interface Events {
  // 事件总线
  [EventEnum.START]: App;
  [EventEnum.READY]: App;
  [EventEnum.BEFORE_ROUTE_CHANGE]: {
    to: RouteLocationNormalized;
    from: RouteLocationNormalized;
  }; // 路由变更前
  [EventEnum.AFTER_ROUTE_CHANGE]: {
    to: RouteLocationNormalized;
    from: RouteLocationNormalized;
    failure: NavigationFailure | undefined;
  }; // 路由变更后
}
const mitter = Mitt<Events & Omit<{ [key in EventEnum]: undefined }, keyof Events>>(); // inferred as Emitter<Events>
export { EventEnum as event, mitter };
