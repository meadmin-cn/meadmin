import request, { RequestOptions } from '@/utils/request.js';
import { PageParams, PageResult } from './api.model.js';

//添加管理员
export class AddAdminParam {
  id?: string; //ID
  username = ''; //用户名
  nickname = ''; //昵称
  password = ''; //密码
  avatar = ''; //头像
  email = ''; //邮箱
  mobile = ''; //手机号
}
export type AdminInfo = AddAdminParam & {
  id: string; //ID
  loginFailure: string; //最后登录时间
};
export function addAdminApi() {
  return request<AdminInfo, [AddAdminParam]>(
    (data) => ({
      url: 'admin/add',
      method: 'POST',
      data: data,
    }),
    { success: true },
  );
}

//修改管理员信息
export type EditAdminParam = Partial<AdminInfo>;
export function upAdminApi(options?: RequestOptions<AdminInfo, [string, EditAdminParam]>) {
  return request<AdminInfo, [string, EditAdminParam]>(
    (id, data) => ({
      url: `admin/${id}`,
      method: 'POST',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//获取管理员列表
export type AdminListResult = PageResult<AdminInfo>;
export class AdminListParam extends PageParams {
  id?: string; //ID
  username?: string; //用户名
  nickname?: string; //昵称
  password?: string; //密码
  avatar?: string; //头像
  email?: string; //邮箱
  mobile?: string; //手机号
  loginFailure?: number; //登录失败次数
  lastLoginAt?: string; //最后登录时间 YYYY-MM-DD HH:mm:ss
  lastLoginIp?: string; //最后登录ip
  status?: number; //状态:1=启用;0=禁用
  isSuper?: number; //超级管理员:1=是;0=不是
  startCreatedAt?: string; //创建时间(起)YYYY-MM-DD HH:mm:ss
  endCreatedAt?: string; //创建时间(止)YYYY-MM-DD HH:mm:ss
  startUpdatedAt?: string; //修改时间(起)YYYY-MM-DD HH:mm:ss
  endUpdatedAt?: string; //修改时间(止)YYYY-MM-DD HH:mm:ss
}
export function adminListApi(options?: RequestOptions<AdminListResult, [AdminListParam]>) {
  return request<AdminListResult, [AdminListParam]>(
    (data) => ({
      url: 'admin/',
      method: 'POST',
      data: data,
    }),
    Object.assign({ noLoading: true }, options),
  );
}

//获取管理员详情
export function adminInfoApi(options?: RequestOptions<AdminInfo, [string]>) {
  return request<AdminInfo, [string]>(
    (id) => ({
      url: `admin/${id}`,
      method: 'get',
    }),
    options,
  );
}

//删除
export function delAdminApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `admin/del/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
