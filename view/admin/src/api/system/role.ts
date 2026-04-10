import type { PageResult } from '@/api/api.model.js';
import { PageParam } from '@/api/api.model.js';
import type { TreeArrayItem } from '@/utils/helper.js';
import type { RequestOptions } from '@/utils/request.js';
import request from '@/utils/request.js';
import type { SystemAdmin } from './admin.js';
import type { SystemMenuInfo } from './menu.js';

//角色
export class SystemRole {
  id?: string; //ID
  parentId = '' as string | null; //父级id
  roleName = '' as string; //角色名称
  roleKey = '' as string; //角色标识
  orderNum = 999 as number | undefined; //排序(降序)
  status = 1 as 1 | 0 | undefined; //状态:1=启用;0=禁用
  remark = '' as string; //备注
  menus = [] as Array<SystemMenuInfo>; //具有权限菜单
  createdAt = '' as string; //创建时间
  updatedAt = '' as string; //最后更新时间
}

export type SystemRoleInfo = SystemRole & {
  id: string; //ID
  isSuper: 1 | 0; //超级管理员:1=是;0=不是
  createdAdmin: Omit<SystemAdmin, 'createdAdmin' | 'updatedAdmin'> | null;
  updatedAdmin: Omit<SystemAdmin, 'createdAdmin' | 'updatedAdmin'> | null;
};
//添加角色信息
export function addSystemRoleApi() {
  return request<SystemRoleInfo, [SystemRole]>(
    (data) => ({
      url: 'system/role/add',
      method: 'post',
      data: data,
    }),
    { success: true },
  );
}

export type SystemRoleListResult = PageResult<SystemRoleInfo>;
export class SystemRoleListParam extends PageParam {
  parentId?: string | null; //父级id
  id?: string; //ID
  roleName?: string; //角色名称
  roleKey?: string; //角色标识
  orderNum?: number; //排序(降序)
  status?: 1 | 0; //状态:1=启用;0=禁用
  remark?: string; //备注
  menus?: Array<SystemMenuInfo> | null; //具有权限菜单
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取角色列表
export function systemRoleListApi(options?: RequestOptions<SystemRoleListResult, [SystemRoleListParam]>) {
  return request<SystemRoleListResult, [SystemRoleListParam]>(
    (data) => ({
      url: 'system/role/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

export type SystemRoleTreeAll = TreeArrayItem<SystemRoleInfo & { menus: { id: string }[] }, 'children'>[];
//获取树形结构
export function systemRoleTreeAllApi(options?: RequestOptions<SystemRoleTreeAll, []>) {
  return request<SystemRoleTreeAll, []>(
    () => ({
      url: 'system/role/treeAll',
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

//根据id获取角色详情
export function systemRoleInfoApi(options?: RequestOptions<SystemRoleInfo, [string]>) {
  return request<SystemRoleInfo & { parent?: SystemRoleInfo | null }, [string]>(
    (id) => ({
      url: `system/role/info/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type UpdateSystemRoleInfoParam = Partial<Omit<SystemRoleInfo, 'menus' | 'id' | 'createdAt' | 'updatedAt' | 'createdAdmin' | 'updatedAdmin'> & { menuIds: string[] }>;
//修改角色信息
export function updateSystemRoleApi(options?: RequestOptions<SystemRoleInfo, [string, UpdateSystemRoleInfoParam]>) {
  return request<SystemRoleInfo, [string, UpdateSystemRoleInfoParam]>(
    (id, data) => ({
      url: `system/role/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除角色
export function delSystemRoleApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `system/role/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
