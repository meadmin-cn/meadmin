import type { Pinia } from 'pinia';
import type { App } from 'vue';
import type { Router } from 'vue-router';
import UserOrders from './views/user/orders.vue';
import { registerUserCenterMenu } from '@/userCenter';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const init = (_app: App, _router: Router, _pinia: Pinia) => {
  registerUserCenterMenu({ key: 'orders', title: '我的订单', path: 'orders', component: UserOrders, order: 30 });
};
