import { PageParam, PageResult } from '@/api/api.model.js';
import request, { RequestOptions } from '@/utils/request.js';

//示例_
export class ExampleDemo {
  mobile = '' as string | null; //手机号
  type = undefined as 0 | 1 | 2 | undefined; //类型:0=书籍;1=电子产品;2=卡片
  name = '' as string; //名称
  books = [] as Array<ExampleBook> | null; //书籍
  user = undefined as User | null | undefined; //用户
  avatar = undefined as File | null | undefined; //头像
  files = [] as Array<File> | null; //附件
}

//示例_书籍
export type ExampleBook = {
  id: string; //ID
  name: string; //名称
  createdAdmin: SystemAdmin | null; //创建者
  updatedAdmin: SystemAdmin | null; //最后更新者
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//管理员
export type SystemAdmin = {
  id: string; //ID
  username: string; //用户名
  nickname: string; //昵称
  password: string; //密码
  avatar: File | null; //头像
  email: string | null; //邮箱
  mobile: string | null; //手机号
  loginFailure: number; //登录失败次数
  lastLoginAt: string | null; //最后登录时间
  lastLoginIp: string; //最后登录ip
  status: 1 | 0; //状态:1=启用;0=禁用
  createdAdmin: SystemAdmin | null; //创建者
  updatedAdmin: SystemAdmin | null; //最后更新者
  roles: Array<SystemRole> | null; //具有的角色
  roleMenus: Array<SystemMenu> | null; //具有权限的菜单
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//附件
export type File = {
  id: string; //ID
  name: string; //文件名
  path: string; //路径
  mimeType: string; //mime类型
  size: number | null; //文件大小
  storage: string; //存储引擎
  md5: string; //文件MD5值
  url: string | null; //文件url
  createdAdminId: string | null; //创建者Id
  createdAdmin: SystemAdmin | null; //创建者
  updatedAdmin: SystemAdmin | null; //最后更新者
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//角色
export type SystemRole = {
  parentId: string | null; //父级id
  id: string; //ID
  roleName: string; //角色名称
  roleKey: string; //角色标识
  orderNum: number; //排序(降序)
  status: 1 | 0; //状态:1=启用;0=禁用
  remark: string; //备注
  admins: Array<SystemAdmin> | null; //关联用户
  menus: Array<SystemMenu> | null; //具有权限菜单
  createdAdmin: SystemAdmin | null; //创建者
  updatedAdmin: SystemAdmin | null; //最后更新者
  isSuper: 1 | 0; //超级管理员:1=是;0=不是
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
  createdAdmin: SystemAdmin | null; //创建者
  updatedAdmin: SystemAdmin | null; //最后更新者
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//用户
export type User = {
  id: string; //ID
  username: string; //用户名
  nickname: string; //昵称
  password: string; //密码
  avatar: UserFile | null; //头像（优先级高于avatarFileId）
  email: string | null; //邮箱
  mobile: string | null; //手机号
  loginFailure: number; //登录失败次数
  lastLoginAt: string | null; //最后登录时间
  lastLoginIp: string; //最后登录ip
  status: 1 | 0; //状态:1=启用;0=禁用
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//用户附件表(前台)
export type UserFile = {
  id: string; //ID
  name: string; //文件名
  path: string; //路径
  mimeType: string; //mime类型
  size: number | null; //文件大小
  storage: string; //存储引擎
  md5: string; //文件MD5值
  url: string | null; //文件url
  createdUserId: string | null; //创建者Id
  createdUser: User | null; //创建者
  updatedUser: User | null; //最后更新者
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

export type ExampleDemoInfo = ExampleDemo & {
  id: string; //ID
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
  createdAdmin: SystemAdmin | null; //创建者
  updatedAdmin: SystemAdmin | null; //最后更新者
};
//添加示例_信息
export function addExampleDemoApi() {
  return request<ExampleDemoInfo, [ExampleDemo]>(
    (data) => ({
      url: 'example/demo/add',
      method: 'post',
      data: data,
    }),
    { success: true },
  );
}

export type ExampleDemoListResult = PageResult<ExampleDemoInfo>;
export class ExampleDemoListParam extends PageParam {
  id?: string; //ID
  mobile?: string | null; //手机号
  type?: 0 | 1 | 2; //类型:0=书籍;1=电子产品;2=卡片
  name?: string; //名称
  books?: Array<ExampleBook> | null; //书籍
  user?: User | null; //用户
  avatar?: File | null; //头像
  files?: Array<File> | null; //附件
  createdAdmin?: SystemAdmin | null; //创建者
  updatedAdmin?: SystemAdmin | null; //最后更新者
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取示例_列表
export function exampleDemoListApi(options?: RequestOptions<ExampleDemoListResult, [ExampleDemoListParam]>) {
  return request<ExampleDemoListResult, [ExampleDemoListParam]>(
    (data) => ({
      url: 'example/demo/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

//根据id获取示例_详情
export function exampleDemoInfoApi(options?: RequestOptions<ExampleDemoInfo, [string]>) {
  return request<ExampleDemoInfo, [string]>(
    (id) => ({
      url: `example/demo/info/${id}`,
      method: 'get',
    }),
    options,
  );
}

export type UpdateExampleDemoInfoParam = Omit<Partial<ExampleDemoInfo>, 'id' | 'createdAt' | 'updatedAt' | 'createdAdmin' | 'updatedAdmin'>;
//修改示例_信息
export function updateExampleDemoApi(options?: RequestOptions<ExampleDemoInfo, [string, UpdateExampleDemoInfoParam]>) {
  return request<ExampleDemoInfo, [string, UpdateExampleDemoInfoParam]>(
    (id, data) => ({
      url: `example/demo/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除示例_
export function delExampleDemoApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `example/demo/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
