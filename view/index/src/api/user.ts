import request, { RequestOptions } from '@/utils/request.js';
import {FileInfo} from './file.js';



export type UserInfo = {
  id: string; //ID
  username:string; //用户名
  nickname:string; //昵称
  avatar:FileInfo | null | undefined; //头像（优先级高于avatarFileId）
  email:string|null; //邮箱
  mobile: string|null; //手机号
  password: string; //密码
  status:1 | 0 ; //状态:1=启用;0=禁用
  lastLoginAt: string | null; //最后登录时间
  lastLoginIp: string; //最后登录ip
  loginFailure: number | undefined; //登录失败次数
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//获取当前用户详情
export function userInfoApi(options?: RequestOptions<UserInfo, []>) {
  return request<UserInfo, []>(
    () => ({
      url: `user/info`,
      method: 'get',
    }),
    options,
  );
}

export type UpdateUserInfoParam = Omit<Partial<UserInfo>, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastLoginAt' | 'lastLoginIp' | 'loginFailure'> & {orgPassword?:string};
//修改当前用户信息
export function updateUserApi(options?: RequestOptions<UserInfo, [UpdateUserInfoParam]>) {
  return request<UserInfo, [UpdateUserInfoParam]>(
    (data) => ({
      url: `user/up`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

