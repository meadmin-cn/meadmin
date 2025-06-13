import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
/**
 * 写入文件【当文件所在文件夹不存在时会递归创建】
 * @param filePath 
 * @param content 
 * @returns 
 */
export function recursionWriteFileSync(filePath, content) {
  const path = dirname(filePath);
  mkdirSync(path, { recursive: true });
  writeFileSync(filePath, content);
  return true;
}