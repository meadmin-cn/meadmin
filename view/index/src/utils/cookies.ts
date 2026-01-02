import cookies, { CookieAttributes } from 'js-cookie';
import type { Context } from '@midwayjs/koa';

let serverCookies: Context['Cookies'];
export const setSterCookies = (cookies: Context['Cookies'])=>{
    serverCookies = cookies;
}
//cookie设置兼容服务端和客户端
export default {
  /**
   * Create a cookie
   */
  set(name: string, value: string, options?: CookieAttributes) {
    if (import.meta.env.SSR) {
     return serverCookies.set(name, value, Object.assign({
      signed: false,  
      httpOnly: false, // 默认是 true
      maxAge: typeof options?.expires === 'number' ? options.expires * 86400 * 1000 : undefined
      },options));
    } else {
      return cookies.set(name, value, options);
    }
  },

  /**
   * Read cookie
   */
  get(name: string) {
    if (import.meta.env.SSR) {
      return serverCookies.get(name,{signed:false});
    } else {
      return cookies.get(name);
    }
  },

  /**
   * Delete cookie
   */
  remove(name: string, options?: CookieAttributes) {
    if (import.meta.env.SSR) {
      serverCookies.set(name, options);
    } else {
      return cookies.remove(name, options);
    }
  },
};
