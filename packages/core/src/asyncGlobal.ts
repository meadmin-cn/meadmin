import { Context } from '@midwayjs/koa';
import { AsyncLocalStorage } from 'node:async_hooks';

export type Global = Record<
  string,
  {
    ctx?: Context;
  }
>;

export const global = {} as Global;
export const globalAsyncLocalStorage = new AsyncLocalStorage();

/**
 * 获取异步上下文
 * @param key 对象key
 * @param id 异步上下文id ,不传入根据上下文自动获取
 * @returns
 */
export const getAsyncGlobal = <K extends keyof Global[string]>(key: K, id?: string) => {
  if (!id) {
    id = globalAsyncLocalStorage.getStore() as string | undefined;
    if (!id) {
      throw Error('必须传入上下文id');
    }
  }
  const info = global[id] || {};
  return info[key];
};

/**
 * 设置异步上下文对象
 * @param key 对象key
 * @param value 对象值
 * @param id 异步上下文id ,不传入根据上下文自动获取
 * @returns
 */
export const setAsyncGloabel = <K extends keyof Global[string]>(key: K, value: Global[string][K], id?: string) => {
  if (!id) {
    id = globalAsyncLocalStorage.getStore() as string | undefined;
    if (!id) {
      throw Error('上下文外执行，必须传入上下文id');
    }
  }
  if (!global[id]) {
    global[id] = {};
  }
  global[id][key] = value;
  return true;
};

/**
 * 移除异步上下文
 * @param key 对象key 传入时只移除对应key，不传入移除所有key
 * @param id 异步上下文id ,不传入根据上下文自动获取
 * @returns
 */
export const removeAsyncGlobal = <K extends keyof Global[string]>(key?: K, id?: string) => {
  if (!id) {
    id = globalAsyncLocalStorage.getStore() as string | undefined;
    if (!id) {
      throw Error('上下文外执行，必须传入上下文id');
    }
  }
  if (key) {
    if (global[id][key] !== undefined) {
      delete global[id][key];
    }
  } else if (global[id]) {
    delete global[id];
  }
  return true;
};

/**
 * 获取异步上下请求Context
 * @returns
 */
export const getContext = () => {
  return getAsyncGlobal('ctx');
};
