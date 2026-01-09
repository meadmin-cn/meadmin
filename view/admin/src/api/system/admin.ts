import request, { RequestOptions } from '@/utils/request.js';
import { PageParam, PageResult } from '@/api/api.model.js';
import { SystemRoleInfo } from './role.js';
import { SystemMenuInfo } from './menu.js';
import { FileInfo } from '../file.js';

//管理员
export class SystemAdmin {
  username = '' as string; //用户名
  nickname = '' as string; //昵称
  password = '' as string; //密码
  avatar = null as FileInfo | null; //头像
  email = '' as string; //邮箱
  mobile = '' as string; //手机号
  status = 1 as 1 | 0 | undefined; //状态:1=启用;0=禁用
  roleIds = [] as string[]; //具有的角色
}

export type SystemAdminInfo = Omit<SystemAdmin,'roleIds'> & {
  id: string; //ID
  loginFailure: number | undefined; //登录失败次数
  lastLoginAt: string | null; //最后登录时间
  lastLoginIp: string; //最后登录ip
  roles: Array<Omit<SystemRoleInfo, 'menus'>>;
  roleMenus: NonNullable<SystemMenuInfo>;
  createdAt: string;//创建时间
  updatedAt: string;//最后更新时间
  createdAdmin: Omit<SystemAdmin,'createdAdmin'|'updatedAdmin'> | null,
  updatedAdmin: Omit<SystemAdmin,'createdAdmin'|'updatedAdmin'> | null,
};
//添加管理员信息
export function addSystemAdminApi() {
  return request<SystemAdminInfo, [SystemAdmin]>(
    (data) => ({
      url: 'system/admin/add',
      method: 'post',
      data: data,
    }),
    { success: true },
  );
}

export type SystemAdminListResult = PageResult<SystemAdminInfo>;
export class SystemAdminListParam extends PageParam {
  id?: string; //ID
  username?: string; //用户名
  nickname?: string; //昵称
  password?: string; //密码
  avatar?: FileInfo | null; //头像
  email?: string; //邮箱
  mobile?: string; //手机号
  loginFailure?: number; //登录失败次数
  startLastLoginAt?: string | null; //最后登录时间(起)
  endLastLoginAt?: string | null; //最后登录时间(止)
  lastLoginIp?: string; //最后登录ip
  status?: 1 | 0; //状态:1=启用;0=禁用
  isSuper?: 1 | 0; //超级管理员:1=是;0=不是
  roles?: Array<Omit<SystemRoleInfo, 'menus'>> | null; //具有的角色
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取管理员列表
export function systemAdminListApi(options?: RequestOptions<SystemAdminListResult, [SystemAdminListParam]>) {
  return request<SystemAdminListResult, [SystemAdminListParam]>(
    (data) => ({
      url: 'system/admin/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

//根据id获取管理员详情
export function systemAdminInfoApi(options?: RequestOptions<SystemAdminInfo, [string]>) {
  return request<SystemAdminInfo, [string]>(
    (id) => ({
      url: `system/admin/info/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type UpdateSystemAdminInfoParam = Omit<Partial<SystemAdminInfo>, 'id' | 'loginFailure' | 'lastLoginAt' | 'lastLoginIp' | 'createdAt' | 'updatedAt' | 'createdAdmin' | 'updatedAdmin'> & {roleIds:string[]};
//修改管理员信息
export function updateSystemAdminApi(options?: RequestOptions<SystemAdminInfo, [string, UpdateSystemAdminInfoParam]>) {
  return request<SystemAdminInfo, [string, UpdateSystemAdminInfoParam]>(
    (id, data) => ({
      url: `system/admin/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除管理员
export function delSystemAdminApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `system/admin/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
