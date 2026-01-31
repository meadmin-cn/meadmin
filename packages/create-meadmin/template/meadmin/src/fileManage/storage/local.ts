import { UploadParam, UploadResult, UpStorageInterface } from '@/types/fileManage.js';
import { app } from '@meadmin/core';
import { UploadOptions, UploadStreamFileInfo } from '@midwayjs/busboy';
import { appendFileSync, createReadStream, createWriteStream, existsSync, mkdirSync, renameSync, rmSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { BaseStorage } from './base.js';
export class LocalStorage extends BaseStorage implements UpStorageInterface {
  get path() {
    return '/' + this.model + '/';
  }
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
  }
  async getFilePath(path: string) {
    return resolve((app.getConfig('busboy') as UploadOptions).upDir + this.path, path);
  }
  async getFileReadSteam(path: string) {
    return createReadStream(await this.getFilePath(path));
  }
  async upload(file: UploadStreamFileInfo, params: UploadParam) {
    const fileUpconfig = app.getConfig('busboy') as UploadOptions;
    const uploadResult = { storage: 'local' } as UploadResult;
    uploadResult.md5 = params.md5;
    //只处理1个文件上传
    const { filename, mimeType } = file;
    if (params.chunk !== '1') {
      //非分片上传
      const res = await this.saveFie(file, params.md5, fileUpconfig.upDir + this.path, fileUpconfig.tmpdir);
      uploadResult.size = res.size;
      uploadResult.path = relative(fileUpconfig.upDir + this.path, res.path);
    } else {
      //分片上传
      const suffix = filename.substring(filename.lastIndexOf('.')); //后缀带着.
      const saveFilePath = resolve(fileUpconfig.upDir + this.path, params.md5 + suffix);
      const saveStat = statSync(saveFilePath, { throwIfNoEntry: false });
      if (saveStat) {
        //已存在无需上传
        uploadResult.size = saveStat.size;
        uploadResult.path = relative(fileUpconfig.upDir + this.path, saveFilePath);
      } else {
        if (params.start === undefined || params.over === undefined || params.chunkMd5 === undefined) {
          throw new Error('分片上传时，start、over、chunkMd5必须有值');
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
        uploadResult.size = statSync(saveFilePath, { throwIfNoEntry: true }).size;
        uploadResult.path = relative(fileUpconfig.upDir + this.path, saveFilePath);
      }
    }
    uploadResult.name = params.name || filename;
    uploadResult.mimeType = mimeType;
    return uploadResult;
  }
}
