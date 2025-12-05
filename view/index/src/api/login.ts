import request from '@/utils/request';

//获取登录验证码
export function loginCaptchaApi<T extends boolean = false>(returnAxios: T = false as T, noLoading = true) {
  return request<{id:string, imageBase64:string}, [number?,number?], T>(
    (width=100,height=30) => ({
      url: 'login/captcha',
      method: 'get',
      params: {width,height},
    }),
    { noLoading },
    returnAxios,
  );
}


// 登录
export class LoginParams {
  username = '';
  password = '';
  captcha = '';
  captchaId = '';
}
export interface LoginResult {
  token: string;
}
export function loginApi<T extends boolean = true>(returnAxios: T = true as T) {
  return request<LoginResult, [LoginParams], T>(
    (params) => ({
      url: 'login/login',
      method: 'post',
      data: params,
    }),
    {},
    returnAxios,
  );
}

// 获取用户详细信息
export interface UserInfo {
  info: Record<string,any>;
}
export function userInfoApi<T extends boolean = false>(returnAxios: T = false as T, noLoading = true) {
  return request<UserInfo, [], T>(
    () => ({
      url: 'login/info',
      method: 'post',
    }),
    { noLoading },
    returnAxios,
  );
}
