import { mkdirSync, writeFileSync, existsSync, rmSync, WriteFileOptions } from 'node:fs';
import { dirname } from 'node:path';
/**
 * 写入文件【当文件所在文件夹不存在时会递归创建】
 * @param filePath 
 * @param content 
 * @returns 
 */
export function recursionWriteFileSync(filePath:string, content:string , options?:WriteFileOptions) {
  const path = dirname(filePath);
  mkdirSync(path, { recursive: true });
  writeFileSync(filePath, content, options);
  return true;
}

/**
 * 删除文件
 * @param filePath 
 */
export function delFileSync(filePath:string){
  if(existsSync(filePath)){
    rmSync(filePath, { recursive: true, force: true });
  }
}