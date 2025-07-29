import request from '@/utils/request';

const enum Api {
  LOGIN = 'login/login',
  USER_INFO = 'login/info',
}

// 登录
export class LoginParams {
  username = '';
  password = '';
  captcha = '';
}
export interface LoginResult {
  token: string;
}
export function loginApi<T extends boolean = true>(returnAxios: T = true as T) {
  return request<LoginResult, [LoginParams], T>(
    (params) => ({
      url: Api.LOGIN,
      method: 'post',
      data: params,
    }),
    {},
    returnAxios,
  );
}

//菜单信息
export type Menu = {
  id: string; //
  parentId: string; //
  title: string; //
  menuType: 1 | 2 | 3; //类型:1=目录;2=菜单;3=按钮
  status: 0 | 1; //
  rule: string; //
  orderNum: number; //
  path: string; //
  isLink: 0 | 1; //
  component: string; //
  hideMenu: 0 | 1; //
  cache: 0 | 1; //
  icon: string; //
  affix: 0 | 1; //
  alwaysShow: 0 | 1; //
  breadcrumb: 0 | 1; //
};

// 获取用户详细信息
export interface UserInfoResult {
  rules: string[]; // 权限
  introduction: string; // 备注
  avatar: string; // 头像
  name: string; // 名称
  username: string; // 用户名
  menus: Menu[];
}
export function userInfoApi<T extends boolean = false>(returnAxios: T = false as T, noLoading = true) {
  return request<UserInfoResult, [], T>(
    () => ({
      url: Api.USER_INFO,
      method: 'post',
    }),
    { noLoading },
    returnAxios,
  );
}
