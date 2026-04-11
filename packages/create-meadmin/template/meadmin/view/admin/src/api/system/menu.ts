import type { PageResult } from '@/api/api.model.js';
import { PageParam } from '@/api/api.model.js';
import type { TreeArrayItem } from '@/utils/helper.js';
import type { RequestOptions } from '@/utils/request.js';
import request from '@/utils/request.js';
import type { SystemAdmin } from './admin.js';

//菜单
export class SystemMenu {
  id?: string; //ID
  parentId = '' as string | null; //父级id
  title = '' as string; //菜单名称
  menuType = undefined as 1 | 2 | 3 | undefined; //类型:1=目录;2=菜单;3=按钮
  status = 1 as 1 | 0 | undefined; //状态:1=启用;0=禁用
  rule = '' as string; //权限
  orderNum = 999 as number | undefined; //排序(降序)
  path = '' as string; //路径
  isLink = 0 as 0 | 1 | undefined; //外链:1=是;0=否
  component = '' as string; //组件路径(相对于views文件夹)
  hideMenu = 0 as 0 | 1 | undefined; //隐藏:1=是;0=否
  cache = 1 as 0 | 1 | undefined; //缓存:1=是;0=否
  icon = '' as string; //图标
  affix = 0 as 0 | 1 | undefined; //固定tag:1=是;0=否
  alwaysShow = 0 as 0 | 1 | undefined; //恒定展示(只有一个子元素时不隐藏):1=是;0=否
  breadcrumb = 1 as 0 | 1 | undefined; //面包屑:1=展示;0=不展示
  createdAt = '' as string; //创建时间
  updatedAt = '' as string; //最后更新时间
}

export type SystemMenuInfo = SystemMenu & {
  id: string; //ID
  createdAdmin: Omit<SystemAdmin, 'createdAdmin' | 'updatedAdmin'> | null;
  updatedAdmin: Omit<SystemAdmin, 'createdAdmin' | 'updatedAdmin'> | null;
};
//添加菜单信息
export function addSystemMenuApi() {
  return request<SystemMenuInfo, [SystemMenu]>(
    (data) => ({
      url: 'system/menu/add',
      method: 'post',
      data: data,
    }),
    { success: true },
  );
}

export type SystemMenuListResult = PageResult<SystemMenuInfo>;
export class SystemMenuListParam extends PageParam {
  parentId?: string | null; //父级id
  id?: string; //ID
  title?: string; //菜单名称
  menuType?: 1 | 2 | 3; //类型:1=目录;2=菜单;3=按钮
  status?: 1 | 0; //状态:1=启用;0=禁用
  rule?: string; //权限
  orderNum?: number; //排序(降序)
  path?: string; //路径
  isLink?: 0 | 1; //外链:1=是;0=否
  component?: string; //组件路径(相对于views文件夹)
  hideMenu?: 0 | 1; //隐藏:1=是;0=否
  cache?: 0 | 1; //缓存:1=是;0=否
  icon?: string; //图标
  affix?: 0 | 1 | 2 | 3 | 4; //固定tag:1=是;0=否
  alwaysShow?: 0 | 1; //恒定展示(只有一个子元素时不隐藏):1=是;0=否
  breadcrumb?: 0 | 1; //面包屑:1=展示;0=不展示
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取菜单列表
export function systemMenuListApi(options?: RequestOptions<SystemMenuListResult, [SystemMenuListParam]>) {
  return request<SystemMenuListResult, [SystemMenuListParam]>(
    (data) => ({
      url: 'system/menu/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

export type SystemMenuTreeAll = TreeArrayItem<SystemMenuInfo, 'children'>[];
//获取树形结构
export function systemMenuTreeAllApi(options?: RequestOptions<SystemMenuTreeAll, []>) {
  return request<SystemMenuTreeAll, []>(
    () => ({
      url: 'system/menu/treeAll',
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

//根据id获取菜单详情
export function systemMenuInfoApi(options?: RequestOptions<SystemMenuInfo, [string]>) {
  return request<SystemMenuInfo & { parent?: SystemMenuInfo | null }, [string]>(
    (id) => ({
      url: `system/menu/info/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type UpdateSystemMenuInfoParam = Omit<Partial<SystemMenuInfo>, 'id' | 'createdAt' | 'updatedAt' | 'createdAdmin' | 'updatedAdmin'>;
//修改菜单信息
export function updateSystemMenuApi(options?: RequestOptions<SystemMenuInfo, [string, UpdateSystemMenuInfoParam]>) {
  return request<SystemMenuInfo, [string, UpdateSystemMenuInfoParam]>(
    (id, data) => ({
      url: `system/menu/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除菜单
export function delSystemMenuApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `system/menu/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
