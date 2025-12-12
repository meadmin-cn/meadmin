import { UploadOptions, UploadStreamFileInfo } from '@midwayjs/busboy';
import type { File } from '../entities/file.entity.js';
import { relative, resolve } from 'node:path';
import { createWriteStream, mkdirSync, renameSync, statSync, appendFileSync, createReadStream, existsSync, rmSync } from 'node:fs';
import { FileCreateDto } from '@/app/admin/dto/fileCreate.dto.js';
import { app } from '@meadmin/core';
export type LocalUpParam = {
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
export const uploadStorage = {
  adminLocal: {
    getUrl(file: File) {
      return `/api/admin/file/get/${file.id}/${file.name}`;
    },
    path:'/admin/',
    //保存文件
    async saveFie({ filename, data }: UploadStreamFileInfo, md5: string, savePath: string, tmpPath: string) {
      const suffix = filename.substring(filename.lastIndexOf('.')); //后缀带着.
      const tmpFilePath = resolve(tmpPath, '__tmp__' + process.pid + '__' + md5 + suffix); //临时文件带上进程id防止重复
      const saveFilePath = resolve(savePath, md5 + suffix);
      const saveStat = statSync(saveFilePath, { throwIfNoEntry: false });
      if (saveStat) {
        return { size: saveStat.size, path: saveFilePath }; //已存在无需上传
      }
      return await new Promise<{ size: number; path: string }>((reslove, reject) => {
        const stream = createWriteStream(tmpFilePath);
        stream.on('close', () => {
          renameSync(tmpFilePath, saveFilePath);
          reslove({ size: statSync(saveFilePath, { throwIfNoEntry: true }).size, path: saveFilePath });
        });
        stream.on('error', (e) => {
          reject(e);
        });
        data.pipe(stream);
      });
    },
    async getFilePath(path: string) {
      return resolve((app.getConfig('busboy') as UploadOptions).upDir+this.path, path);
    },
    async getFileReadSteam(path: string) {
      return createReadStream(await this.getFilePath(path));
    },
    async upload(file: UploadStreamFileInfo, params: LocalUpParam) {
      const fileUpconfig = app.getConfig('busboy') as UploadOptions;
      const fileParams = { storage: 'adminLocal' } as FileCreateDto;
      fileParams.md5 = params.md5;
      //只处理1个文件上传
      const { filename, mimeType } = file;
      if (params.chunk !== '1') {
        //非分片上传
        const res = await this.saveFie(file, params.md5, fileUpconfig.upDir+this.path, fileUpconfig.tmpdir);
        fileParams.size = res.size;
        fileParams.path = relative(fileUpconfig.upDir+this.path, res.path);
      } else {
        //分片上传
        const suffix = filename.substring(filename.lastIndexOf('.')); //后缀带着.
        const saveFilePath = resolve(fileUpconfig.upDir+this.path, params.md5 + suffix);
        const saveStat = statSync(saveFilePath, { throwIfNoEntry: false });
        if (saveStat) {
          //已存在无需上传
          fileParams.size = saveStat.size;
          fileParams.path = relative(fileUpconfig.upDir+this.path, saveFilePath);
        } else {
          if(params.start === undefined || params.over === undefined || params.chunkMd5 === undefined){
            throw new Error('分片上传时，start、over、chunkMd5必须有值')
          }
          const path = resolve(fileUpconfig.tmpdir, params.md5 + '/');
          if (!existsSync(path)) {
            mkdirSync(path);
          }
          const res = await this.saveFie(file, params.chunkMd5, path, path);
          const tmpFilePath = resolve(fileUpconfig.tmpdir, '__tmp__chunk_all__' + process.pid + '__' + params.md5 + suffix); //临时文件带上进程id防止重复
          appendFileSync(tmpFilePath, ''); //追加空串确保文件存在
          await new Promise<void>((resolve, reject) => {
            const fsStream = createWriteStream(tmpFilePath, { flags: 'r+', start: +params.start, autoClose: true });
            fsStream.on('close', () => {
              resolve();
            });
            fsStream.on('error', (e) => {
              reject(e);
            });
            createReadStream(res.path).pipe(fsStream);
          });
          if (params.over !== '1') {
            //未结束直接返回
            return null;
          }
          renameSync(tmpFilePath, saveFilePath);
          rmSync(path, { force: true, recursive: true });
          fileParams.size = statSync(saveFilePath, { throwIfNoEntry: true }).size;
          fileParams.path = relative(fileUpconfig.upDir+this.path, saveFilePath);
        }
      }
      fileParams.name = params.name || filename;
      fileParams.mimeType = mimeType;
      return fileParams;
    },
  },
};
