import { FileInfo, uploadFileApi } from '@/api/file.js';
import { UploadProgressEvent, UploadRawFile, UploadRequestOptions, } from 'element-plus';
import SparkMD5 from 'spark-md5';
import md5WorkerURL from './fileMd5Work.js?url';
const md5Worker = new Worker(md5WorkerURL, { type: 'module' });


export class UploadAjaxError extends Error {
  name = 'UploadAjaxError'
  status: number
  method: string
  url: string

  constructor(message: string, status: number, method: string, url: string) {
    super(message)
    this.status = status
    this.method = method
    this.url = url
  }
}

/**
 * 获取文件md5
 * @param file
 * @param chunkSize
 * @param progress
 * @returns
 */
const getMd5 = (file: UploadRawFile, chunkSize = 1024 * 1024, progress?: (progress: string) => void) =>
  new Promise<string>((resolve, reject) => {
    const workHandler = (e: MessageEvent) => {
      const data = e.data;
      if (data.uid !== file.uid) {
        return;
      }
      if (data.status === 'success') {
        md5Worker.removeEventListener('message', workHandler);
        resolve(data.md5);
      } else if (data.status === 'progress') {
        // 计算中，更新进度
        progress?.(data.percent);
      } else if (data.status === 'failed') {
        md5Worker.removeEventListener('message', workHandler);
        // 计算中，更新进度
        reject(data.error);
      }
    };
    // worker 的监听
    md5Worker.addEventListener('message', workHandler);
    // 通知 worker 计算 MD5
    md5Worker.postMessage({ file, chunkSize, uid: file.uid });
  });

//执行分片上传
const uploadChunksExecute = (file: UploadRawFile, currentChunk: number, chunkSize: number, data: UploadRequestOptions['data'] = {}) =>
  new Promise<Partial<FileInfo>>((resolve, reject) => {
    try{
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try{
          const formData = new FormData();
          const upFile = new File([e.target!.result || ''], file.name, { type: file.type });
          data.start = start + '';
          data.chunkMd5 = SparkMD5.ArrayBuffer.hash(e.target!.result as ArrayBuffer);
          Object.keys(data).forEach((key) => {
            formData.append(key, Array.isArray(data[key]) ? String(data[key]) : data[key]);
          });
          formData.append('file', upFile);
          //执行文件上传
          return resolve( await uploadFileApi()(formData));
        }catch(e){
          reject(e);
        }
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
      fileReader.readAsArrayBuffer(File.prototype.slice.call(file, start, end));
    }catch(e){
      reject(e);
    }
  });
/**
 * 文件分片上传
 * @param file
 * @param chunkSize
 * @param data
 * @param progress
 * @returns
 */
const uploadChunks = (file: UploadRawFile, chunkSize: number, data: UploadRequestOptions['data'] = {}, progress?: (progress: string) => void) =>
  new Promise(async (resolve, reject) => {
    try {
      let currentChunk = 0;
      const chunks = Math.ceil(file.size / chunkSize); // 总分片数
      if (chunks > 1) {
        //先上传一个分片确保校验和秒传
        const res = await uploadChunksExecute(file, currentChunk, chunkSize, Object.assign(data, { chunkIndex: currentChunk + '', over: '0'  }));
        if (res.id) {
          progress?.('100');
          return resolve(res);
        }
        currentChunk++;
        progress?.(((currentChunk / chunks) * 100).toFixed(2));
        //一次并发上传3个分片
        const parallelNum = 3;
        for (; currentChunk < (chunks - 1); ) {
          const promiseArr = [];
          for (let i = 0; i < parallelNum; i++) {
            if (currentChunk < (chunks - 1)) {
              promiseArr.push(uploadChunksExecute(file, currentChunk, chunkSize, Object.assign(data, { chunkIndex: currentChunk + '', over: '0' })));
              currentChunk++;
            }
          }
          await Promise.all(promiseArr);
          progress?.(((currentChunk / chunks) * 100).toFixed(2));
        }
      }
      //确保上传完其余分片再上传最后一个分片
      const res = await uploadChunksExecute(file, currentChunk, chunkSize, Object.assign(data, { chunkIndex: currentChunk + '', over: '1' }));
      progress?.('100');
      return resolve(res);
    } catch (e) {
      reject(e);
    }
  });

//上传请求兼容 element-plus上传事件
export const fileUpload = async (options: UploadRequestOptions) => {
  try{
    const chunkSize = 1024 * 1024;
    const progressEvt = new ProgressEvent('uploadProgress', {
      lengthComputable: true,
      loaded: 0,
      total: 100,
    }) as UploadProgressEvent;
    progressEvt.percent = 0;
    // 将 MD5 值放到请求参数里
    options.data.md5 = await getMd5(options.file, chunkSize, (process) => {
      //md5进度占总进度5%
      progressEvt.percent = (+process * 5) / 100;
      options.onProgress(progressEvt);
    });
    options.data.chunk = '1';
    options.data.name = options.file.name;
    // 上传分片,第一个分片会查询文件是否存在
    const res = await uploadChunks(options.file, chunkSize, options.data, (process) => {
      //上传进度占总进度95%
      progressEvt.percent = (+process * 95) / 100 + 5;
      options.onProgress(progressEvt);
    });
    return res;//调用onSuccess和return后都会触发Success事件，这里只返回不调用，否则会触发两遍Success事件；
  }catch(error: any){
    options.onError(new UploadAjaxError(error.message, error?.status || 500, 'post','file/upload'));
  }
};
