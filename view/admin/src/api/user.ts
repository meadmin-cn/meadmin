import { PageParam, PageResult } from '@/api/api.model.js';
import request, { RequestOptions } from '@/utils/request.js';
import { UserFileInfo } from './userFile.js';

//前台用户
export class User {
  username = '' as string; //用户名
  nickname = '' as string; //昵称
  password = '' as string; //密码
  avatar = undefined as UserFileInfo | null | undefined; //头像
  email = '' as string | null; //邮箱
  mobile = '' as string | null; //手机号
  loginFailure = undefined as number | undefined; //登录失败次数
  lastLoginAt = '' as string | null; //最后登录时间
  lastLoginIp = '' as string; //最后登录ip
  status = undefined as 1 | 0 | undefined; //状态:1=启用;0=禁用
  createdUserId = '' as string | null; //创建者Id
  createdUser = undefined as User | null | undefined; //创建者
  updatedUser = undefined as User | null | undefined; //最后更新者
}

export type UserInfo = User & {
  id: string; //ID
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};
//添加用户信息
export function addUserApi() {
  return request<UserInfo, [User]>(
    (data) => ({
      url: 'user/add',
      method: 'post',
      data: data,
    }),
    { success: true },
  );
}

export type UserListResult = PageResult<UserInfo>;
export class UserListParam extends PageParam {
  id?: string; //ID
  username?: string; //用户名
  nickname?: string; //昵称
  password?: string; //密码
  avatar?: UserFileInfo | null; //头像
  email?: string | null; //邮箱
  mobile?: string | null; //手机号
  loginFailure?: number; //登录失败次数
  startLastLoginAt?: string | null; //最后登录时间(起)
  endLastLoginAt?: string | null; //最后登录时间(止)
  lastLoginIp?: string; //最后登录ip
  status?: 1 | 0; //状态:1=启用;0=禁用
  createdUserId?: string | null; //创建者Id
  createdUser?: User | null; //创建者
  updatedUser?: User | null; //最后更新者
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取用户列表
export function userListApi(options?: RequestOptions<UserListResult, [UserListParam]>) {
  return request<UserListResult, [UserListParam]>(
    (data) => ({
      url: 'user/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

//根据id获取用户详情
export function userInfoApi(options?: RequestOptions<UserInfo, [string]>) {
  return request<UserInfo, [string]>(
    (id) => ({
      url: `user/info/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type UpdateUserInfoParam = Omit<Partial<UserInfo>, 'id' | 'createdAt' | 'updatedAt'>;
//修改用户信息
export function updateUserApi(options?: RequestOptions<UserInfo, [string, UpdateUserInfoParam]>) {
  return request<UserInfo, [string, UpdateUserInfoParam]>(
    (id, data) => ({
      url: `user/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除用户
export function delUserApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `user/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
