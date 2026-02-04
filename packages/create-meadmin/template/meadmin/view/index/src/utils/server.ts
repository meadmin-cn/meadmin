const cacheObj = {} as Record<string, Record<string, Array<any>>>;
/**
 * 设置缓存(服务端)
 * @param key
 * @param res
 * @returns
 */
export function setServerCache(key: string, res: any, ssrVersion: string) {
  if (import.meta.env.SSR) {
    if (!cacheObj[ssrVersion]) {
      cacheObj[ssrVersion] = {};
    }
    if (cacheObj[ssrVersion][key]) {
      cacheObj[ssrVersion][key].push(res);
    } else {
      cacheObj[ssrVersion][key] = [res];
    }
    return;
  }
  throw new Error('只支持在服务端调用!');
}

/**
 * 移除cache（单次）
 * @param key
 */
export function rmServerCache(key: string, ssrVersion?: string) {
  if (import.meta.env.SSR) {
    if (!ssrVersion) {
      throw new Error('服务端调用时必须传入ssrVersion!');
    }
    (cacheObj[ssrVersion]?.[key] ?? []).shift();
  } else {
    (window.__serverCache?.[key] ?? []).shift();
  }
}

/**
 * 获取单个缓存,客户端获取成功后会清除缓存
 * @param key
 * @returns
 */
export function getServerCache(key: string) {
  if (import.meta.env.SSR) {
    throw new Error('只支持在客户端调用!');
  } else {
    return (window.__serverCache?.[key] ?? []).shift();
  }
}

/**
 * 获取所有缓存内容（服务端）
 * @returns
 */
export function getAllServerCache(ssrVersion: string) {
  if (!import.meta.env.SSR) {
    throw new Error('只支持在服务端调用!');
  }
  return cacheObj[ssrVersion];
}

/**
 * 清空所有缓存内容（服务端）
 * @returns
 */
export function cleanServerCache(ssrVersion: string) {
  if (!import.meta.env.SSR) {
    throw new Error('只支持在服务端调用!');
  }
  if (cacheObj[ssrVersion]) {
    delete cacheObj[ssrVersion];
  }
}
