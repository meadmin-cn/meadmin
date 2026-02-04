import type { Context } from '@midwayjs/koa';
import cookies, { CookieAttributes } from 'js-cookie';

const serverCookies = {} as Record<string, Context['Cookies']>;
export const setServerCookies = (ssrVersion: string, cookies: Context['Cookies']) => {
  if (!cookies) {
    if (serverCookies[ssrVersion]) {
      delete serverCookies[ssrVersion];
    }
  } else {
    serverCookies[ssrVersion] = cookies;
  }
};
//cookie设置兼容服务端和客户端
export default {
  /**
   * Create a cookie
   */
  set(ssrVersion: string, name: string, value: string, options?: CookieAttributes) {
    if (import.meta.env.SSR) {
      return serverCookies[ssrVersion].set(
        name,
        value,
        Object.assign(
          {
            signed: false,
            httpOnly: false, // 默认是 true
            maxAge: typeof options?.expires === 'number' ? options.expires * 86400 * 1000 : undefined,
          },
          options,
        ),
      );
    } else {
      return cookies.set(name, value, options);
    }
  },

  /**
   * Read cookie
   */
  get(ssrVersion: string, name: string) {
    if (import.meta.env.SSR) {
      return serverCookies[ssrVersion].get(name, { signed: false });
    } else {
      return cookies.get(name);
    }
  },

  /**
   * Delete cookie
   */
  remove(ssrVersion: string, name: string, options?: CookieAttributes) {
    if (import.meta.env.SSR) {
      serverCookies[ssrVersion].set(name, options);
    } else {
      return cookies.remove(name, options);
    }
  },
};
