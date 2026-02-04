# 前台页面

## 注意事项

支持服务端渲染，开发需寻遵循以下事项，以兼容服务端渲染特性

- 如需使用window对象需增加服务端渲染判断
```
if (!import.meta.env.SSR) {
  //下面代码仅在客户端执行
  window.addEventListener('resize', () => mitter.emit(event.RESIZE));
}

```

- request请求需在setup顶层创建，以规避服务端渲染“跨请求状态污染”
```
//login.vue
<script setup lang="ts" name="Login">
//...
import {  loginCaptchaApi } from '@/api/login';
const { data: captchaObj, runAsync: getCaptchRun } = loginCaptchaApi();
const getCaptch = async () => {
  await getCaptchRun();
  //...
};
await getCaptch();
//...
</script>

```
- 如在组件外发送请求需透传app给request方法，
```
//login.ts
export function loginApi<T extends boolean = true>(returnAxios: T = true as T, app?:App) {
  return request<LoginResult, [LoginParams], T>(
    (params) => ({
      url: 'login/login',
      method: 'post',
      data: params,
    }),
    {},
    returnAxios,
    app,
  );
}
```
```
 // userStore
  login: async function (app:App, params: LoginParams) {
    //...
    const res = await loginApi(true,app)(params);
    //...
  },
```
```
//login.vue
const _this = getCurrentInstance();
const submit = async () => {
  //...
  await userStore.login(_this!.appContext.app,loginParams);
};
//...
```
- 请求直接，在setp 顶层await否则服务端渲染期间无法获取到数据。

- 如需在组件外创建store，需传入pinia
```
//request.ts

export function request<R, P extends unknown[] = [], T = boolean>(
  axiosConfig: (...args: P) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
  options?: RequestOptions<R, P>,
  returnAxios?: T,
  app?: App,
) {
//...
 store = app?.config.globalProperties.$pinia;
 const userStore = useUserStore(store);
//...
}

```

