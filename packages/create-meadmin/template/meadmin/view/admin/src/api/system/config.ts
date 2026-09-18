import type { PageResult } from '@/api/api.model.js';
import { PageParam } from '@/api/api.model.js';
import type { RequestOptions } from '@/utils/request.js';
import request from '@/utils/request.js';

export type SystemConfigGroupType = 'base' | 'dict' | 'custom';
export type SystemConfigVariableType = 'string' | 'number' | 'text' | 'textarea' | 'multiline' | 'array' | 'keyvalue' | 'dict';
export type SystemConfigValue = string | number | null | Array<string | number> | Record<string, string | number | boolean>;
export type SystemConfigOption = { label: string; value: string | number; sort: number; status: number };
export type SystemConfigDictOption = Pick<SystemConfigOption, 'label' | 'value'>;

export class SystemConfigGroupListParam extends PageParam {
  groupCode?: string;
  groupName?: string;
  groupType?: SystemConfigGroupType;
  isBuiltin?: boolean;
  status?: number;
}

export type SystemConfigGroupInfo = {
  id: string;
  groupCode: string;
  groupName: string;
  groupType: SystemConfigGroupType;
  isBuiltin: boolean;
  sortOrder: number;
  description: string;
  status: number;
  configs?: SystemConfigInfo[];
};

export class SystemConfigListParam extends PageParam {
  groupId?: string;
  variableCode?: string;
  variableType?: SystemConfigVariableType;
  variableTitle?: string;
  status?: number;
  keyword?: string;
}

export type SystemConfigInfo = {
  id: string;
  variableCode: string;
  variableType: SystemConfigVariableType;
  variableTitle: string;
  sortOrder: number;
  isBuiltin: boolean;
  groupId: string;
  value: SystemConfigValue;
  options: SystemConfigOption[];
  isRequired: boolean;
  status: number;
  description: string;
};

export type SystemConfigGroupCreateParam = {
  groupCode: string;
  groupName: string;
  sortOrder?: number;
  description?: string;
  status?: number;
};

export type SystemConfigGroupUpdateParam = Partial<SystemConfigGroupCreateParam>;
export type SystemConfigCreateParam = Omit<SystemConfigInfo, 'id' | 'isBuiltin'>;
export type SystemConfigUpdateParam = Partial<Omit<SystemConfigInfo, 'id' | 'isBuiltin'>>;
export type SystemConfigGroupSortParam = { groupId: string; targetGroupId: string };
export type SystemConfigValueItem = { variableCode: string; value: SystemConfigValue; options?: SystemConfigOption[] };

export function systemConfigGroupListApi(options?: RequestOptions<PageResult<SystemConfigGroupInfo>, [SystemConfigGroupListParam]>) {
  return request<PageResult<SystemConfigGroupInfo>, [SystemConfigGroupListParam]>(
    (data) => ({
      url: 'system/config/group',
      method: 'post',
      data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

export function systemConfigGroupInfoApi(options?: RequestOptions<SystemConfigGroupInfo, [string]>) {
  return request<SystemConfigGroupInfo, [string]>(
    (id) => ({
      url: `system/config/group/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export function addSystemConfigGroupApi(options?: RequestOptions<SystemConfigGroupInfo, [SystemConfigGroupCreateParam]>) {
  return request<SystemConfigGroupInfo, [SystemConfigGroupCreateParam]>(
    (data) => ({
      url: 'system/config/group/add',
      method: 'post',
      data,
    }),
    Object.assign({ success: true }, options),
  );
}

export function updateSystemConfigGroupApi(options?: RequestOptions<SystemConfigGroupInfo, [string, SystemConfigGroupUpdateParam]>) {
  return request<SystemConfigGroupInfo, [string, SystemConfigGroupUpdateParam]>(
    (id, data) => ({
      url: `system/config/group/up/${id}`,
      method: 'post',
      data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

export function sortSystemConfigGroupApi(options?: RequestOptions<SystemConfigGroupInfo, [SystemConfigGroupSortParam]>) {
  return request<SystemConfigGroupInfo, [SystemConfigGroupSortParam]>(
    (data) => ({
      url: 'system/config/group/sort',
      method: 'post',
      data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

export function delSystemConfigGroupApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `system/config/group/del/${id}`,
      method: 'post',
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

export function systemConfigListApi(options?: RequestOptions<PageResult<SystemConfigInfo>, [SystemConfigListParam]>) {
  return request<PageResult<SystemConfigInfo>, [SystemConfigListParam]>(
    (data) => ({
      url: 'system/config/',
      method: 'post',
      data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

export function systemConfigInfoApi(options?: RequestOptions<SystemConfigInfo, [string]>) {
  return request<SystemConfigInfo, [string]>(
    (id) => ({
      url: `system/config/info/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export function addSystemConfigApi(options?: RequestOptions<SystemConfigInfo, [SystemConfigCreateParam]>) {
  return request<SystemConfigInfo, [SystemConfigCreateParam]>(
    (data) => ({
      url: 'system/config/add',
      method: 'post',
      data,
    }),
    Object.assign({ success: true }, options),
  );
}

export function updateSystemConfigApi(options?: RequestOptions<SystemConfigInfo, [string, SystemConfigUpdateParam]>) {
  return request<SystemConfigInfo, [string, SystemConfigUpdateParam]>(
    (id, data) => ({
      url: `system/config/up/${id}`,
      method: 'post',
      data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

export function delSystemConfigApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `system/config/del/${id}`,
      method: 'post',
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

// 字典配置独立接口：与配置字段接口分离，使用字典专属权限。
export function addSystemDictApi(options?: RequestOptions<SystemConfigInfo, [SystemConfigCreateParam]>) {
  return request<SystemConfigInfo, [SystemConfigCreateParam]>(
    (data) => ({
      url: 'system/config/dict/add',
      method: 'post',
      data,
    }),
    Object.assign({ success: true }, options),
  );
}

export function updateSystemDictApi(options?: RequestOptions<SystemConfigInfo, [string, SystemConfigUpdateParam]>) {
  return request<SystemConfigInfo, [string, SystemConfigUpdateParam]>(
    (id, data) => ({
      url: `system/config/dict/up/${id}`,
      method: 'post',
      data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

export function delSystemDictApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `system/config/dict/del/${id}`,
      method: 'post',
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

export function systemConfigDictListApi(options?: RequestOptions<PageResult<SystemConfigInfo>, [SystemConfigListParam]>) {
  return request<PageResult<SystemConfigInfo>, [SystemConfigListParam]>((data) => ({ url: 'system/config/', method: 'post', data }), Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options));
}

export function systemConfigValuesApi(options?: RequestOptions<SystemConfigInfo[], [string]>) {
  return request<SystemConfigInfo[], [string]>(
    (groupCode) => ({
      url: `system/config/value/${groupCode}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export function saveSystemConfigValuesApi(options?: RequestOptions<SystemConfigInfo[], [string, { values: SystemConfigValueItem[] }]>) {
  return request<SystemConfigInfo[], [string, { values: SystemConfigValueItem[] }]>(
    (groupCode, data) => ({
      url: `system/config/value/${groupCode}`,
      method: 'post',
      data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

export function systemConfigDictApi(options?: RequestOptions<SystemConfigDictOption[], [string]>) {
  return request<SystemConfigDictOption[], [string]>(
    (code) => ({
      url: `system/config/dict/${code}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
