import { ssrVersionKey } from '@/app.js';
import { storeKey, useUserStore } from '@/store';
import { closeLoading, loading } from '@/utils/loading';
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { ElMessage } from 'element-plus';
import { Pinia } from 'pinia';
import qs from 'qs';
import { App, inject } from 'vue';
import { Options, setGlobalOptions, useRequest } from 'vue-request';
import { Router, useRouter } from 'vue-router';
import { clearEmptyParam } from './helper.js';
import log from './log';
import { getServerCache, rmServerCache, setServerCache } from './server.js';

export type RequestOptions<R, P extends unknown[]> = {
  needAll?: boolean; // 需要所有的格式，而不仅仅是data
  noLoading?: boolean; // 不需要加载特效
  noError?: boolean; // 不需要错误提示
  success?: boolean; //成功后提示
  clearEmpty?: any[]; //去除请求参数的空值数组
  serverCacheKey?: string; //服务端接口缓存key
} & Options<R, P>;

setGlobalOptions({
  manual: true, // 请求需要手动调用
  // ...
});

// 请求函数，当请求失败时直接抛出异常;
export function request<R, P extends unknown[] = []>(
  axiosConfig: (...args: P) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
  options?: RequestOptions<R, P>,
): ReturnType<typeof useRequest<R, P>>;
export function request<R, P extends unknown[] = [], T extends boolean = boolean>(
  axiosConfig: (...args: P) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
  options: RequestOptions<R, P>,
  returnAxios: T,
  app?: App,
): T extends true ? (...args: P) => Promise<R> : ReturnType<typeof useRequest<R, P>>;

/**
 * 请求函数
 * @param axiosConfig  axios的配置项
 * @param options vue request配置项+自定义配置项参考 RequestOptions
 * @param returnAxios 直接返回axios
 * @param app app示例，当非setup顶层调用时必填
 * @returns
 */
export function request<R, P extends unknown[] = [], T = boolean>(
  axiosConfig: (...args: P) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
  options?: RequestOptions<R, P>,
  returnAxios?: T,
  app?: App,
) {
  let ssrVersion = '';
  let store: Pinia | undefined;
  let router: Router | undefined;
  if (import.meta.env.SSR) {
    ssrVersion = app?.config.globalProperties.$ssrVersion;
    store = app?.config.globalProperties.$pinia;
    if (!ssrVersion) {
      ssrVersion = inject(ssrVersionKey) ?? '';
      if (!ssrVersion) {
        throw new Error('服务端渲染期间，非setup顶层调用必须传入app');
      }
    }
    if (!store) {
      store = inject(storeKey);
      if (!store) {
        throw new Error('服务端渲染期间，非setup顶层调用必须传入app');
      }
    }
  }
  router = app?.config.globalProperties.$router;
  if (!router) {
    router = useRouter();
    if (!router) {
      throw new Error('非setup顶层调用必须传入store');
    }
  }
  const service = axios.create({
    baseURL: import.meta.env.SSR ? import.meta.env.VIEW_INDEX_API_SERVER_PREFIX : import.meta.env.VIEW_INDEX_API_CLIENT_PREFIX, // url = base url + request url
    timeout: 10000, // request timeout
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat', skipNulls: true }), // 数组query参数转换为repeat a=1&a=2,null值会被删除
  });
  // 请求拦截器
  service.interceptors.request.use(
    (config) => {
      // 在发送请求之前做一些事情
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }
      const userStore = useUserStore(store);
      if (userStore.token) {
        config.headers['Authorization'] = 'Bearer ' + userStore.token;
      }
      return config;
    },
    (error) => {
      // 对请求错误做些什么
      log.error(error); // for debug
      throw Error('请求异常，请联系管理员'); // 改写错误信息
    },
  );
  service.interceptors.response.use(
    (response) => {
      // 2xx 范围内的状态码都会触发该函数。
      // 对响应数据做点什么
      return response;
    },
    (error) => {
      // 超出 2xx 范围的状态码都会触发该函数。
      // 对响应错误做点什么
      log.error(error); // for debug
      throw Error('操作失败，请稍后重试');
    },
  );

  const axiosService = async (...args: P): Promise<R> => {
    try {
      //loading放到微任务中去执行以确保在自动调用请求时等待所有的宏任务中的生命周期函数执行完再创建loading实例 以规避currentInstance的相关警告
      !options?.noLoading && Promise.resolve(undefined).then(loading);
      const config = await axiosConfig(...args);
      if (options?.clearEmpty) {
        if (config.params) config.params = clearEmptyParam(config.params, options?.clearEmpty);
        if (config.data) config.data = clearEmptyParam(config.data, options?.clearEmpty);
      }
      let serverCacheKey = options?.serverCacheKey;
      if (!serverCacheKey) {
        serverCacheKey = JSON.stringify(config) + '__';
      }
      serverCacheKey = '__req__' + serverCacheKey;
      let res: any;
      if (import.meta.env.SSR) {
        res = (await service(config)).data;
        setServerCache(serverCacheKey, res, ssrVersion);
      } else {
        res = getServerCache(serverCacheKey);
        if (res === undefined) {
          res = (await service(config)).data;
        } else {
          //服务端已请求完毕的接口，从缓存直接获取并且 模拟下一个微任务规避时机，异步组件时机问题导致的slot警告。
          await new Promise<void>((reslove) => {
            setTimeout(() => {
              reslove();
            }, 0);
          });
        }
      }
      if (!res || res.code === undefined) {
        throw Error('返回值解析失败', res);
      }
      // 401：认证失败
      if (res.code === '401') {
        if (import.meta.env.SSR) {
          rmServerCache(serverCacheKey);
        }
        useUserStore(store).logOut(router);
        throw Error(res.msg);
      }
      if (res.code !== '200') {
        throw Error(res.msg);
      }
      if (options?.success) {
        ElMessage.success({ message: res.msg });
      }
      !options?.noLoading && closeLoading();
      return options?.needAll ? res : res.data;
    } catch (e) {
      !options?.noLoading && closeLoading();
      !options?.noError &&
        ElMessage.error({
          message: e instanceof Error ? e.message : String(e),
        });
      throw e;
    }
  };

  return returnAxios ? axiosService : useRequest<R, P>(axiosService, options);
}

export default request;
