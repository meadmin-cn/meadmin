import type { PageResult } from '@/api/api.model.js';
import { PageParam } from '@/api/api.model.js';
import type { SystemAdminInfo } from '@/api/system/admin.js';
import type { RequestOptions } from '@/utils/request.js';
import request from '@/utils/request.js';
import type { UserInfo } from './user.js';

//用户附件表(前台)
export class UserFile {
  createdUserId = '' as string | null; //创建者Id
  createdUser = undefined as UserInfo | null | undefined; //创建者
  updatedUser = undefined as UserInfo | null | undefined; //最后更新者
  name = '' as string; //文件名
  path = '' as string; //路径
  mimeType = '' as string; //mime类型
  size = undefined as number | undefined; //文件大小
  storage = '' as string; //存储引擎
  md5 = '' as string; //文件MD5值
}

export type UserFileInfo = UserFile & {
  id: string; //ID
  url: string;
  size: number;
  createdAt: string; //创建时间
  updatedAt: string; //最后更新时间
  createdAdmin: SystemAdminInfo | null; //创建者
  updatedAdmin: SystemAdminInfo | null; //最后更新者
};
/**
 * 上传文件
 * FormData参数说明
 * file File 文件
 * md5 string  md5值
 * sharding '0'|'1' 分片上传:0=否;1=是
 * chunkMd5 string 当前分片md5值
 * chunkIndex string 当前片序号(从0开始)
 * start string 当前分片起止位置(从0开始)
 * over string 是否结束(需确保最后一个分片上传时其他分片请求已完成):0=否;1=是
 *
 * @returns
 */
export function uploadFileApi<T extends boolean = true>(returnAxios = true as T) {
  return request<Partial<UserFileInfo>, [FormData], T>(
    (data) => ({
      url: 'userFile/upload',
      method: 'post',
      data: data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    { success: false, noLoading: true },
    returnAxios,
  );
}

export type UserFileListResult = PageResult<UserFileInfo>;
export class UserFileListParam extends PageParam {
  createdUserId?: string | null; //创建者Id
  createdUser?: UserFile | null; //创建者
  updatedUser?: UserFile | null; //最后更新者
  createdAdmin?: SystemAdminInfo | null; //创建者
  updatedAdmin?: SystemAdminInfo | null; //最后更新者
  id?: string; //ID
  name?: string; //文件名
  path?: string; //路径
  mimeType?: string; //mime类型
  size?: number | null; //文件大小
  storage?: string; //存储引擎
  md5?: string; //文件MD5值
  url?: string | null; //文件url
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取用户附件表(前台)列表
export function userFileListApi(options?: RequestOptions<UserFileListResult, [UserFileListParam]>) {
  return request<UserFileListResult, [UserFileListParam]>(
    (data) => ({
      url: 'userFile/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

//根据id获取用户附件表(前台)详情
export function userFileInfoApi(options?: RequestOptions<UserFileInfo, [string]>) {
  return request<UserFileInfo, [string]>(
    (id) => ({
      url: `userFile/info/${id}`,
      method: 'get',
    }),
    Object.assign({ noLoading: true }, options),
  );
}

export type UpdateUserFileInfoParam = Omit<Partial<UserFileInfo>, 'id' | 'createdAt' | 'updatedAt' | 'createdAdmin' | 'updatedAdmin'>;
//修改用户附件表(前台)信息
export function updateUserFileApi(options?: RequestOptions<UserFileInfo, [string, UpdateUserFileInfoParam]>) {
  return request<UserFileInfo, [string, UpdateUserFileInfoParam]>(
    (id, data) => ({
      url: `userFile/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除用户附件表(前台)
export function delUserFileApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `userFile/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
