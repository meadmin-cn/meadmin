import { loginApi, LoginParams, userInfoApi } from '@/api/login';
import { UserInfo } from '@/api/user.js';
import { loginConfig as config } from '@/config';
import { PageEnum } from '@/dict/pageEnum';
import { event, mitter } from '@/event';
import cookies from '@/utils/cookies.js';
import { loading } from '@/utils/loading';
import { App, Ref } from 'vue';
import { Router } from 'vue-router';
import useRouteStore from './route';
interface UserState {
  user: UserInfo; // 用户信息
  token: Ref<string>; // 用户token
  ssrVersion: Ref<string>; //ssr版本号
}
export default defineStore('user', {
  state: (): UserState => {
    let _token = '';
    let _ssrVersion = '';
    return {
      user: {} as UserInfo,
      ssrVersion: customRef<string>((track, trigger) => {
        return {
          get() {
            // track 方法放在 get 中，用于提示这个数据是需要追踪变化的
            track();
            return _ssrVersion;
          },
          set(ssrVersion: string) {
            _ssrVersion = ssrVersion;
            trigger(); // 记得触发事件 trigger,告诉vue触发页面更新
          },
        };
      }),
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
              cookies.set(_ssrVersion, config.tokenName, token, {
                expires: config.tokenExpires,
                domain: config.tokenDomain,
              });
            } else {
              cookies.remove(_ssrVersion, config.tokenName, {
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
    init: async function (app: App, tokenValue?: string) {
      if (app) {
        this.ssrVersion = app.config.globalProperties.$ssrVersion;
      }
      const token = tokenValue ?? cookies.get(this.ssrVersion, config.tokenName);
      if (token) {
        this.token = token;
        this.user = await userInfoApi(true, !tokenValue, app)();
      } else {
        this.token = '';
      }
      if (!app.config.globalProperties.$pinia || !app.config.globalProperties.$router) {
        throw new Error('请在pinia及router初始化完成后再调用');
      }
      useRouteStore(app.config.globalProperties.$pinia).initRoutes(app.config.globalProperties.$router); //初始化路由
    },
    // 登录
    login: async function (app: App, params: LoginParams) {
      mitter.emit(event.BEFORE_LOGIN);
      const res = await loginApi(true, app)(params);
      await this.init(app, res.token);
      mitter.emit(event.AFTER_LOGIN);
    },
    // 退出
    logOut: async function (router: Router) {
      loading();
      await Promise.allSettled(mitter.emit(event.BEFORE_LOGOUT));
      this.token = '';
      await router.replace({
        path: PageEnum.LOGIN,
      });
      if (!import.meta.env.SSR) {
        window.location.reload();
      }
    },
  },
});
