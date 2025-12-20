import request, { RequestOptions } from '@/utils/request.js';



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
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

export type UserInfo = {
  id: string; //ID
  username:string; //用户名
  nickname:string; //昵称
  avatar:UserFile | null | undefined; //头像（优先级高于avatarFileId）
  email:string|null; //邮箱
  mobile: string|null; //手机号
  password: string; //密码
  status:1 | 0 ; //状态:1=启用;0=禁用
  lastLoginAt: string | null; //最后登录时间
  lastLoginIp: string; //最后登录ip
  loginFailure: number | undefined; //登录失败次数
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
};

//根据id获取用户详情
export function userInfoApi(options?: RequestOptions<UserInfo, [string]>) {
  return request<UserInfo, [string]>(
    (id) => ({
      url: `user/info/${id}`,
      method: 'get',
    }),
    options,
  );
}

export type UpdateUserInfoParam = Omit<Partial<UserInfo>, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'lastLoginAt' | 'lastLoginIp' | 'loginFailure'>;
//修改用户信息
export function updateUserApi(options?: RequestOptions<UserInfo, [string, UpdateUserInfoParam]>) {
  return request<UserInfo, [string, UpdateUserInfoParam]>(
    (id, data) => ({
      url: `user/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

