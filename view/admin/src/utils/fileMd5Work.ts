// file-md5-worker.ts
import { UploadRawFile } from 'element-plus';
import SparkMD5 from 'spark-md5';

type MD5MessageType = {
  file: File;
  chunkSize: number;
  cancel?: boolean;
  uid: number;
};
// 正在处理的文件记录，当值为 false 时，表示被终止了。
const progressingFilesMap = new Map<number, boolean>();
// 用 web worker 来处理文件 MD5 的计算
self.addEventListener('message', (e: MessageEvent) => {
  const { file, cancel, chunkSize, uid } = e.data as MD5MessageType;
  if (cancel && progressingFilesMap.has(uid)) {
    // 将正在处理的文件标识设置成 false，以备在 getFileMd5 方法中进行终止
    progressingFilesMap.set(uid, false);
  } else if (file) {
    // 开始计算 DM5
    getFileMd5(file, chunkSize)
      .then((md5) => {
        // 计算完成，发送通知
        self.postMessage({
          status: 'success',
          uid: uid,
          md5,
        });
      })
      .catch((error) => {
        self.postMessage({
          status: 'failed',
          uid: uid,
          error,
        });
      });
  }
});
/**
 * 生成进度
 * @param totalChunk 总片数
 * @param uid 文件的 uid
 * @returns 更新进度，参数 processedChunk 为已处理的分片数
 */
const getProgress = (totalChunk: number, uid: number) => {
  let preTime = 0,
    percent = 0;
  return (processedChunk: number) => {
    const now = Date.now();
    // 控制触发间隔大于 500 毫秒
    // 当已经结束，就马上触发
    if (now - preTime > 500 || processedChunk >= totalChunk) {
      percent = Math.min(1, processedChunk / totalChunk) * 100;
      // 发送进度通知
      self.postMessage({
        status: 'progress',
        uid,
        percent: percent.toFixed(2),
      });
      preTime = now;
    }
  };
};

/**
 * 获取文件MD5，采用分片的模式读取文件，最后合并生成 MD5
 * @param file
 * @param uid
 * @param chunkSize // 分片大小 单位字节
 * @returns {Promise<unknown>}
 */
const getFileMd5 = (file: File, uid:number, chunkSize = 1024 * 1024) => {
  const fileReader = new FileReader();
  const blobSlice = File.prototype.slice;
  const chunks = Math.ceil(file.size / chunkSize); // 总分片数
  const updateProgress = getProgress(chunks, uid);
  let currentChunk = 0;
  const spark = new SparkMD5.ArrayBuffer();
  progressingFilesMap.set(uid, true);
  return new Promise<string>((resolve, reject) => {
    fileReader.onload = (e) => {
      if (!e.target?.result) {
        return loadNext(); //处理下一个分片
      }
      spark.append(e.target.result as ArrayBuffer);
      updateProgress(++currentChunk);
      if (progressingFilesMap.get(uid) !== true) {
        // 被终止，则移除
        progressingFilesMap.delete(uid);
        reject('Be cancelled');
      } else if (currentChunk < chunks) {
        // 未结束，则处理下一个分片
        loadNext();
      } else {
        // 处理完成
        progressingFilesMap.delete(uid);
        return resolve(spark.end());
      }
    };
    fileReader.onerror = (e) => {
      reject(e);
    };
    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    };
    loadNext();
  });
};
