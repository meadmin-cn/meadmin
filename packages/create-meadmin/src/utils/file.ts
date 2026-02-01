import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, WriteFileOptions, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
/**
 * 写入文件【当文件所在文件夹不存在时会递归创建】
 * @param filePath
 * @param content
 * @returns
 */
export function recursionWriteFileSync(filePath: string, content: string, options?: WriteFileOptions) {
  const path = dirname(filePath);
  mkdirSync(path, { recursive: true });
  writeFileSync(filePath, content, options);
  return true;
}

/**
 * 删除文件(递归删除)
 * @param filePath
 */
export function delFileSync(filePath: string) {
  if (existsSync(filePath)) {
    rmSync(filePath, { recursive: true, force: true });
    return true;
  }
}

/**
 * package.json 文件名互相转换，已规避lint-staged 模板转换问题
 * @param file
 * @param isEncodePackage
 * @returns
 */
export function encodePackageFileName(file: string, isEncodePackage: boolean) {
  if (isEncodePackage) {
    if (file.endsWith('package.json')) {
      return file.replace('package.json', 'packageTemplate.json');
    }
  } else if (file.endsWith('packageTemplate.json')) {
    return file.replace('packageTemplate.json', 'package.json');
  }
  return file;
}
/**
 * copy文件
 * @param fromFile
 * @param toFile
 * @param fileSetFunction
 * @param isEncodeFileName
 * @returns
 */
export async function copyFile(fromFile: string, toFile: string, fileSetFunction?: (content: string) => string, isEncodePackage = true) {
  let content = readFileSync(fromFile, 'utf-8');
  if (fileSetFunction) {
    content = await fileSetFunction(content);
  }
  return recursionWriteFileSync(encodePackageFileName(toFile, isEncodePackage), content);
}

/**
 * copy 文件夹
 * @param pathFile
 * @param toPath
 * @param relativePath
 * @param ignoreFile
 * @param fileSetFunctions
 * @param isEncodeFileName
 * @returns
 */
export async function copyPath(pathFile, toPath, relativePath = '', ignoreFile = [] as Array<string | RegExp>, fileSetFunctions?: Record<string, (content: string) => string>, isEncodePackage = true) {
  const fileList = readdirSync(pathFile);
  return Promise.all(
    fileList.map(async (file) => {
      const relativeFilePath = join(relativePath, file).replaceAll('\\', '/');
      for (let i = 0; i < ignoreFile.length; i++) {
        const item = ignoreFile[i];
        if (item instanceof RegExp) {
          if (item.test(relativeFilePath)) {
            return;
          }
        } else if (item === relativeFilePath) {
          return;
        }
      }
      const path = resolve(pathFile, file);
      const toSetPath = resolve(toPath, file);
      const stats = statSync(path);
      if (stats.isDirectory()) {
        mkdirSync(toSetPath, { recursive: true });
        //文件夹递归处理
        copyPath(path, toSetPath, relativeFilePath, ignoreFile, fileSetFunctions, isEncodePackage);
      } else {
        if (fileSetFunctions) {
          const files = Object.keys(fileSetFunctions);
          for (let i = 0; i < files.length; i++) {
            if (files[i] === relativeFilePath) {
              return await copyFile(path, toSetPath, fileSetFunctions[files[i]], isEncodePackage);
            }
          }
        }
        await copyFile(path, toSetPath, undefined, isEncodePackage);
      }
      return true;
    }),
  );
}
