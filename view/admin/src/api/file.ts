import request, { RequestOptions } from '@/utils/request.js';
import { PageParam, PageResult } from '@/api/api.model.js';
import { SystemAdminInfo } from './system/admin.js';

//附件
export class File {
  id?: string; //ID
  name = '' as string; //文件名
  path = '' as string; //路径
  mimeType = '' as string; //mime类型
  size = undefined as number | null | undefined; //文件大小(字节)
  storage = '' as string; //存储引擎
  url = ''; //访问地址
  createdAdmin = undefined as Omit<SystemAdminInfo,'roles'|'roleMenus'> | undefined; //创建者
  createdAt = '' as string; //创建时间
  updatedAt = '' as string; //最后更新时间
}


export type FileInfo = Required<File> & {
  id: string; //ID
  createdAdmin: NonNullable<File['createdAdmin']>;
   size:number;
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
export function uploadFileApi() {
  return request<Partial<FileInfo>, [FormData]>(
    (data) => ({
      url: 'file/upload',
      method: 'post',
      data: data,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    }),
    { success: false, noLoading:true },
  );
}

export type FileListResult = PageResult<FileInfo>;
export class FileListParam extends PageParam {
  id?: string; //ID
  filename?: string; //文件名
  path?: string; //路径
  mimeType?: string; //mime类型
  size?: number | null; //文件大小(字节)
  storage?: string; //存储引擎
  startCreatedAt?: string; //创建时间(起)
  endCreatedAt?: string; //创建时间(止)
  startUpdatedAt?: string; //最后更新时间(起)
  endUpdatedAt?: string; //最后更新时间(止)
}
//获取附件列表
export function fileListApi(options?: RequestOptions<FileListResult, [FileListParam]>) {
  return request<FileListResult, [FileListParam]>(
    (data) => ({
      url: 'file/',
      method: 'post',
      data: data,
    }),
    Object.assign({ noLoading: true, clearEmpty: ['', undefined, null] }, options),
  );
}

//根据id获取附件详情
export function fileInfoApi(options?: RequestOptions<FileInfo, [string]>) {
  return request<FileInfo, [string]>(
    (id) => ({
      url: `file/info/${id}`,
      method: 'get',
    }),
    options,
  );
}

export type UpdateFileInfoParam = Partial<FileInfo>;
//修改附件信息
export function updateFileApi(options?: RequestOptions<FileInfo, [string, UpdateFileInfoParam]>) {
  return request<FileInfo, [string, UpdateFileInfoParam]>(
    (id, data) => ({
      url: `file/up/${id}`,
      method: 'post',
      data: data,
    }),
    Object.assign({ success: true, noLoading: true }, options),
  );
}

//删除附件
export function delFileApi(options?: RequestOptions<null, [string]>) {
  return request<null, [string]>(
    (id) => ({
      url: `file/del/${id}`,
      method: 'post',
    }),
    Object.assign({ noLoading: true }, options),
  );
}
