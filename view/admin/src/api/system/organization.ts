import type { PageResult } from '@/api/api.model.js';
import { PageParam } from '@/api/api.model.js';
import type { SystemAdminInfo } from '@/api/system/admin.js';
import type { RequestOptions } from '@/utils/request.js';
import request from '@/utils/request.js';

//组织
export class SystemOrganization {
  parentId = '' as string | null; //父级id
  parent = undefined as SystemOrganization | null | undefined; //父级
  orgName = '' as string; //组织名称
  orderNum = undefined as number | undefined; //排序(降序)
  status = undefined as 1 | 0 | undefined; //状态:1=启用;0=禁用
  remark = '' as string; //备注
  leader = '' as string; //负责人
  phone = '' as string; //联系电话
  email = '' as string; //邮箱
  admins = [] as Array<SystemAdminInfo>; //关联管理员
}

//获取管理员信息
export function getSystemAdminApi() {
  return request<
    PageResult<SystemAdmin>,
    [
      {
        id?: string;
        username?: string;
        page: number;
        pageSize: number;
      },
    ]
  >(
    (data) => ({
      url: 'system/organization/getSystemAdmin',
      method: 'post',
      data: data,
    }),
    { noLoading: true },
  );
}

export type SystemOrganizationInfo = SystemOrganization & {
  id: string; //ID
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
  createdAdmin: SystemAdminInfo | null; //创建者(管理员)
  updatedAdmin: SystemAdminInfo | null; //最后更新者(管理员)
};
//添加组织信息
export function addSystemOrganizationApi() {
  return request<SystemOrganizationInfo, [SystemOrganization]>(
    (data) => ({
      url: 'system/organization/add',
      method: 'post',
      data: data,
    }),
    { success: true },
  );
}

export type SystemOrganizationListResult = PageResult<SystemOrganizationInfo>;
export class SystemOrganizationListParam extends PageParam {
  createdAdmin?: SystemAdminInfo | null; //创建者(管理员)
  updatedAdmin?: SystemAdminInfo | null; //最后更新者(管理员)
  parentId?: string | null; //父级id
  id?: string; //ID
  parent?: SystemOrganization | null; //父级
  orgName?: string; //组织名称
  orderNum?: number; //排序(降序)
  status?: 1 | 0; //状态:1=启用;0=禁用
  remark?: string; //备注
  leader?: string; //负责人
  phone?: string; //联系电话
  email?: string; //邮箱
  admins?: Array<SystemAdminInfo>; //关联管理员
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取组织列表
export function systemOrganizationListApi(options?: RequestOptions<SystemOrganizationListResult, [SystemOrganizationListParam]>) {
  return request<SystemOrganizationListResult, [SystemOrganizationListParam]>(
    (data) => ({
      url: 'system/organization/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

//根据id获取组织详情
export function systemOrganizationInfoApi(options?: RequestOptions<SystemOrganizationInfo, [string]>) {
  return request<SystemOrganizationInfo, [string]>(
    (id) => ({
      url: `system/organization/info/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type UpdateSystemOrganizationInfoParam = Omit<Partial<SystemOrganizationInfo>, 'id' | 'createdAt' | 'updatedAt' | 'createdAdmin' | 'updatedAdmin'>;
//修改组织信息
export function updateSystemOrganizationApi(options?: RequestOptions<SystemOrganizationInfo, [string, UpdateSystemOrganizationInfoParam]>) {
  return request<SystemOrganizationInfo, [string, UpdateSystemOrganizationInfoParam]>(
    (id, data) => ({
      url: `system/organization/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除组织
export function delSystemOrganizationApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `system/organization/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
