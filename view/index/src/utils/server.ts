const cacheObj = {} as Record<string,Array<any>>;
/**
 * 设置缓存(服务端)
 * @param key 
 * @param res 
 * @returns 
 */
export  function setServerCache(key:string, res:any){
  if(import.meta.env.SSR ){
    if(cacheObj[key]){
      cacheObj[key].push(res);
    }else{
      cacheObj[key] = [res];
    }
    return;
  }
  throw new Error('只支持在服务端调用!');
} 

/**
 * 获取单个缓存,客户端获取成功后会清除缓存
 * @param key 
 * @returns 
 */
export function getServerCache(key:string){
  if(import.meta.env.SSR ){
    throw new Error('只支持在客户端调用!');
  }else{
    return (window.__serverCache?.[key] ?? []).shift();
  }
}

/**
 * 获取所有缓存内容（服务端）
 * @returns 
 */
export  function  getAllServerrCache(){
  if(!import.meta.env.SSR ){
    throw new Error('只支持在服务端调用!');
  }
  return cacheObj;
}