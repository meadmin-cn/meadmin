import request, { RequestOptions } from '@/utils/request.js';
import { PageParam, PageResult } from '@/api/api.model.js';

//管理员
export class SystemAdmin {
  id?: string; //ID
  username = '' as string; //用户名
  nickname = '' as string; //昵称
  password = '' as string; //密码
  avatar = '' as string; //头像
  email = '' as string; //邮箱
  mobile = '' as string; //手机号
  status = 1 as 1 | 0 | undefined; //状态:1=启用;0=禁用
  isSuper = 0 as 1 | 0 | undefined; //超级管理员:1=是;0=不是
  roles = [] as Array<SystemRole> | null; //具有的角色
  roleMenus = [] as Array<SystemMenu> | null; //具有权限的菜单
  createdAt = '' as string; //创建时间
  updatedAt = '' as string; //最后更新时间
}

//角色
export type SystemRole = {
  parentId: string | null; //父级id
  id: string; //ID
  roleName: string; //角色名称
  roleKey: string; //角色标识
  orderNum: number; //排序(降序)
  status: 1 | 0; //状态:1=启用;0=禁用
  remark: string; //备注
  admins: {} | null; //关联用户
  menus: Array<SystemMenu> | null; //具有权限菜单
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//菜单
export type SystemMenu = {
  parentId: string | null; //父级id
  id: string; //ID
  title: string; //菜单名称
  menuType: 1 | 2 | 3; //类型:1=目录;2=菜单;3=按钮
  status: 1 | 0; //状态:1=启用;0=禁用
  rule: string; //权限
  orderNum: number; //排序(降序)
  path: string; //路径
  isLink: 0 | 1; //外链:1=是;0=否
  component: string; //组件路径(相对于views文件夹)
  hideMenu: 0 | 1; //隐藏:1=是;0=否
  cache: 0 | 1; //缓存:1=是;0=否
  icon: string; //图标
  affix: 0 | 1; //固定tag:1=是;0=否
  alwaysShow: 0 | 1; //恒定展示(只有一个子元素时不隐藏):1=是;0=否
  breadcrumb: 0 | 1; //面包屑:1=展示;0=不展示
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

export type SystemAdminInfo = SystemAdmin & {
  id: string; //ID
  loginFailure: number | undefined; //登录失败次数
  lastLoginAt: string | null; //最后登录时间
  lastLoginIp: string; //最后登录ip
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
  avatar?: string; //头像
  email?: string; //邮箱
  mobile?: string; //手机号
  loginFailure?: number; //登录失败次数
  startLastLoginAt?: string | null; //最后登录时间(起)
  endLastLoginAt?: string | null; //最后登录时间(止)
  lastLoginIp?: string; //最后登录ip
  status?: 1 | 0; //状态:1=启用;0=禁用
  isSuper?: 1 | 0; //超级管理员:1=是;0=不是
  roles?: Array<SystemRole> | null; //具有的角色
  roleMenus?: Array<SystemMenu> | null; //具有权限的菜单
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
    options,
  );
}

export type UpdateSystemAdminInfoParam = Omit<Partial<SystemAdminInfo>, 'loginFailure' | 'lastLoginAt' | 'lastLoginIp'>;
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
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
