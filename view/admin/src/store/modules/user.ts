import type { LoginParams, UserInfoResult } from '@/api/login';
import { loginApi, userInfoApi } from '@/api/login';
import { loginConfig as config } from '@/config';
import { PageEnum } from '@/dict/pageEnum';
import { event, mitter } from '@/event';
import { router } from '@/router';
import { loading } from '@/utils/loading';
import { initDynamicViewsModules, transitionComponent } from '@/utils/permission.js';
import cookies from 'js-cookie';
import type { Ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { listToTree, statusToBoolean } from '../../utils/helper';
import useRouteStore from './route';
interface UserState {
  user: UserInfoResult['info']; // 用户信息
  rules: string[] | undefined; // 用户权限信息
  menus: RouteRecordRaw[]; //用户菜单数组
  token: Ref<string>; // 用户token
}
export default defineStore('user', {
  state: (): UserState => {
    let _token = '';
    return {
      user: {} as UserInfoResult['info'],
      rules: undefined,
      menus: [],
      token: customRef<string>((track, trigger) => {
        return {
          get() {
            // track 方法放在 get 中，用于提示这个数据是需要追踪变化的
            track();
            return _token;
          },
          set(token: string) {
            _token = token;
            if (token) {
              cookies.set(config.tokenName, token, {
                expires: config.tokenExpires,
                domain: config.tokenDomain,
              });
            } else {
              cookies.remove(config.tokenName, {
                domain: config.tokenDomain,
              });
            }
            trigger(); // 记得触发事件 trigger,告诉vue触发页面更新
          },
        };
      }),
    };
  },
  actions: {
    // 初始化
    init: async function (tokenValue?: string) {
      const token = tokenValue ?? cookies.get(config.tokenName);
      if (token) {
        this.token = token;
        const res = await userInfoApi(true, !tokenValue)();
        this.user = res.info;
        initDynamicViewsModules();
        this.rules = res.btnRules;
        this.menus = listToTree(
          res.menus.map((item) => ({
            id: item.id,
            path: item.path,
            parentId: item.parentId,
            component: transitionComponent(item.component),
            meta: {
              // 标题设置该路由在侧边栏和面包屑中展示的名字
              title: item.title,
              // 对应权限 多个之间为或的关系
              rule: [item.rule],
              // 是否是固定的tag
              affix: statusToBoolean(item.affix),
              // 图标
              icon: item.icon,
              // 外链
              isLink: statusToBoolean(item.isLink),
              // 如果设置为true，则不会被 <keep-alive> 缓存
              noCache: !statusToBoolean(item.cache),
              // 在菜单中隐藏
              hideMenu: statusToBoolean(item.hideMenu),
              // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式
              // 只有一个时，会将那个子路由当做根路由显示在侧边栏
              // 若你想不管路由下面的 children 声明的个数都显示你的根路由
              // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
              alwaysShow: statusToBoolean(item.alwaysShow),
              // 是否需要面包屑 false不展示在面包屑,ture一直展示在面包屑,undefined当只有一个子元素面包屑时跳过展示
              breadcrumb: statusToBoolean(item.breadcrumb),
            },
          })),
        );
        await useRouteStore().initRoutes(); //初始化路由
      } else {
        this.token = '';
      }
    },
    // 登录
    login: async function (params: LoginParams) {
      mitter.emit(event.BEFORE_LOGIN);
      const res = await loginApi()(params);
      await this.init(res.token);
      mitter.emit(event.AFTER_LOGIN);
    },
    // 退出
    logOut: async function () {
      loading();
      await Promise.allSettled(mitter.emit(event.BEFORE_LOGOUT));
      this.token = '';
      await router.replace({
        path: PageEnum.LOGIN,
      });
      window.location.reload();
    },
  },
});
