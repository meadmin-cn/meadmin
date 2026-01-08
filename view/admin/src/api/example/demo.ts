import { PageParam, PageResult } from '@/api/api.model.js';
import { FileInfo } from '@/api/file.js';
import { SystemAdminInfo } from '@/api/system/admin.js';
import request, { RequestOptions } from '@/utils/request.js';

//示例_Demo
export class ExampleDemo {
  mobile = '' as string | null; //手机号
  type = undefined as 0 | 1 | 2 | undefined; //类型:0=书籍;1=电子产品;2=卡片
  name = '' as string; //名称
  books = [] as Array<ExampleBook>; //书籍
  user = undefined as User | null | undefined; //用户
  avatar = undefined as FileInfo | null | undefined; //头像
  files = [] as Array<FileInfo>; //附件
}

//示例_书籍
export type ExampleBook = {
  createdAdmin: SystemAdminInfo | null; //创建者
  updatedAdmin: SystemAdminInfo | null; //最后更新者
  id: string; //ID
  name: string; //名称
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
  createdUserId: string | null; //创建者Id
  createdUser: User | null; //创建者
  updatedUser: User | null; //最后更新者
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//用户附件表(前台)
export type UserFile = {
  createdUserId: string | null; //创建者Id
  createdUser: User | null; //创建者
  updatedUser: User | null; //最后更新者
  id: string; //ID
  name: string; //文件名
  path: string; //路径
  mimeType: string; //mime类型
  size: number | null; //文件大小
  storage: string; //存储引擎
  md5: string; //文件MD5值
  url: string | null; //文件url
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//获取用户信息
export function getUserApi() {
  return request<
    PageResult<User>,
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
      url: 'example/demo/getUser',
      method: 'post',
      data: data,
    }),
    { noLoading: true },
  );
}

//获取示例_书籍信息
export function getExampleBookApi() {
  return request<
    PageResult<ExampleBook>,
    [
      {
        id?: string;
        name?: string;
        page: number;
        pageSize: number;
      },
    ]
  >(
    (data) => ({
      url: 'example/demo/getExampleBook',
      method: 'post',
      data: data,
    }),
    { noLoading: true },
  );
}

export type ExampleDemoInfo = ExampleDemo & {
  id: string; //ID
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
  createdAdmin: SystemAdminInfo | null; //创建者
  updatedAdmin: SystemAdminInfo | null; //最后更新者
};
//添加示例_Demo信息
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
  createdAdmin?: SystemAdminInfo | null; //创建者
  updatedAdmin?: SystemAdminInfo | null; //最后更新者
  id?: string; //ID
  mobile?: string | null; //手机号
  type?: 0 | 1 | 2; //类型:0=书籍;1=电子产品;2=卡片
  name?: string; //名称
  books?: Array<ExampleBook>; //书籍
  user?: User | null; //用户
  avatar?: FileInfo | null; //头像
  files?: Array<FileInfo>; //附件
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取示例_Demo列表
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

//根据id获取示例_Demo详情
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
//修改示例_Demo信息
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

//删除示例_Demo
export function delExampleDemoApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `example/demo/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
