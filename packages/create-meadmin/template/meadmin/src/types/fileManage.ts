import { UploadStreamFileInfo } from '@midwayjs/busboy';
import { ReadStream } from 'node:fs';

export type UploadParam = {
  //文件名
  name: string;
  //md5值
  md5: string;
  //分片上传:0=否;1=是
  chunk: string;
  //当前分片md5值
  chunkMd5?: string;
  //当前分片起止位置(从0开始)/
  start?: string;
  //是否结束(需确保最后一个分片上传时其他分片请求已完成):0=否;1=是
  over?: string;
};
export type UploadResult = {
  storage: string;
  md5: string;
  name: string;
  mimeType: string;
  size: number;
  path: string;
};
export interface UpStorageInterface {
  model: string; //用户的model一般为
  /**
   * 上次文件函数，需支持断点续传
   * @param file 文件
   * @param params 参数
   * @returns Promise<null | UploadResult> | null | UploadResult ,null 断点未上传完成，UploadResult文件上传完毕|
   */
  upload: (file: UploadStreamFileInfo, params: UploadParam) => Promise<null | UploadResult> | null | UploadResult;
  /**
   * 获取文件真实访问路径
   * @param path 相对路径
   * @returns Promise<string> | string 完整路径
   */
  getFilePath: (path: string) => Promise<string> | string;
  /**
   * 获取文件读取流
   * @param path 相对路径
   * @returns Promise<ReadStream> | ReadStream 读取流
   */
  getFileReadSteam: (path: string) => Promise<ReadStream> | ReadStream;
}
export type UpStorageFunction = (model: string) => UpStorageInterface;
