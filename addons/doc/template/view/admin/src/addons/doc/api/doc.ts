import { PageParam, PageResult } from '@/api/api.model.js';
import { FileInfo } from '@/api/file.js';
import { SystemAdminInfo } from '@/api/system/admin.js';
import { TreeArrayItem } from '@/utils/helper.js';
import request, { RequestOptions } from '@/utils/request.js';

//文档
export class AonDoc {
  parentId = '' as string | null; //父级id
  title = '' as string; //名称
  icon = undefined as FileInfo | null | undefined; //图标(200*200)
  parent = undefined as AonDoc | null | undefined; //父级
  type = undefined as 1 | 2 | undefined; //类型:1=目录;2=菜单
  status = 1 as 1 | 0; //状态:1=启用;0=禁用
  orderNum = 99 as number | undefined; //排序(降序)
  contentType = 0 as 0 | 1; //内容类型:0=markdown;1=外链
  mdContent = '' as string; //内容
  link = '' as string | null; //外链地址
  version='';//版本
  label = null as string|null;//标识
}

export type AonDocInfo = AonDoc & {
  id: string; //ID
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
  createdAdmin: SystemAdminInfo | null; //创建者(管理员)
  updatedAdmin: SystemAdminInfo | null; //最后更新者(管理员)
};
//添加文档信息
export function addAonDocApi() {
  return request<AonDocInfo, [AonDoc]>(
    (data) => ({
      url: 'aonDoc/add',
      method: 'post',
      data: data,
    }),
    { success: true },
  );
}

export type AonDocListResult = PageResult<AonDocInfo>;
export class AonDocListParam extends PageParam {
  createdAdmin?: SystemAdminInfo | null; //创建者(管理员)
  updatedAdmin?: SystemAdminInfo | null; //最后更新者(管理员)
  parentId?: string | null; //父级id
  id?: string; //ID
  title?: string; //名称
  icon?: FileInfo | null; //图标(200*200)
  parent?: AonDoc | null; //父级
  type?: 1 | 2; //类型:1=目录;2=菜单
  status?: 1 | 0; //状态:1=启用;0=禁用
  orderNum?: number; //排序(降序)
  contentType?: 0 | 1; //内容类型:0=markdown;1=外链
  mdContent?: string | null; //内容
  link?: string | null; //外链地址
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取文档列表
export function aonDocListApi(options?: RequestOptions<AonDocListResult, [AonDocListParam]>) {
  return request<AonDocListResult, [AonDocListParam]>(
    (data) => ({
      url: 'addons/doc/doc/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

//根据id获取文档详情
export function aonDocInfoApi(options?: RequestOptions<AonDocInfo, [string]>) {
  return request<AonDocInfo, [string]>(
    (id) => ({
      url: `addons/doc/doc/info/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type UpdateAonDocInfoParam = Omit<Partial<AonDocInfo>, 'id' | 'createdAt' | 'updatedAt' | 'createdAdmin' | 'updatedAdmin'>;
//修改文档信息
export function updateAonDocApi(options?: RequestOptions<AonDocInfo, [string, UpdateAonDocInfoParam]>) {
  return request<AonDocInfo, [string, UpdateAonDocInfoParam]>(
    (id, data) => ({
      url: `addons/doc/doc/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除文档
export function delAonDocApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `addons/doc/doc/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type AonDocInfoTreeAll = TreeArrayItem<AonDocInfo, 'children'>[];
//获取树形结构
export function aonDocTreeAllApi(options?: RequestOptions<AonDocInfoTreeAll, []>) {
  return request<AonDocInfoTreeAll, []>(
    () => ({
      url: 'addons/doc/doc/treeAll',
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
