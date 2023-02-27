import * as fs from 'fs';
import * as path from 'path';

/**
 * 遍历文件夹下面的所有文件
 * @param currentDirPath 需要遍历的路径
 * @param callback 回调地址
 * @param filtrate 过滤函数
 * @param result 结果集
 * @returns
 */
export function walkSync<T extends any[], R>(
  currentDirPath: string,
  callback: (...args: T) => R,
  filtrate: (filePath: string, dirent: fs.Dirent) => T | void = (
    filePath,
    dirent,
  ) => [filePath, dirent] as T,
  result: R[] = [],
) {
  fs.readdirSync(currentDirPath, { withFileTypes: true }).forEach((dirent) => {
    const filePath = path.join(currentDirPath, dirent.name);
    if (dirent.isFile()) {
      const r = filtrate(filePath, dirent);
      r && result.push(callback(...r));
    } else if (dirent.isDirectory()) {
      walkSync(filePath, callback, filtrate, result);
    }
  });
  return result;
}
