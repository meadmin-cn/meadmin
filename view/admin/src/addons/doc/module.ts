import type { Pinia } from 'pinia';
import type { App } from 'vue';
import type { Router } from 'vue-router';
//如需注册START 、READY事件回调，可在此文件直接注册
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const init = (app: App, router: Router, pinia: Pinia) => {
  //初始化后及READY生命周期后调用，可以做自定义处理，
};
