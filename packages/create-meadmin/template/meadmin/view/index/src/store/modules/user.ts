import { loginApi, LoginParams, userInfoApi } from '@/api/login';
import { UserInfo } from '@/api/user.js';
import { loginConfig as config } from '@/config';
import { PageEnum } from '@/dict/pageEnum';
import { event, mitter } from '@/event';
import { router } from '@/router';
import cookies from '@/utils/cookies.js';
import { loading } from '@/utils/loading';
import { Ref } from 'vue';
import useRouteStore from './route';
interface UserState {
  user: UserInfo; // 用户信息
  token: Ref<string>; // 用户token
}
export default defineStore('user', {
  state: (): UserState => {
    let _token = '';
    return {
      user: {} as UserInfo,
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
        this.user = await userInfoApi(true, !tokenValue)();
      } else {
        this.token = '';
      }
      useRouteStore().initRoutes(); //初始化路由
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
      if (!import.meta.env.SSR) {
        window.location.reload();
      }
    },
  },
});
