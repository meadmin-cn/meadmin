import { createReadStream, WriteFileOptions } from 'node:fs';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { AsyncZipDeflate, Zip, type DeflateOptions } from 'fflate';

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
 * 删除文件
 * @param filePath
 */
export function delFileSync(filePath: string) {
  if (existsSync(filePath)) {
    rmSync(filePath, { recursive: true, force: true });
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
  if (!existsSync(fromFile)) {
    return;
  }
  let content = readFileSync(fromFile, 'utf-8');
  if (fileSetFunction) {
    content = await fileSetFunction(content);
    return recursionWriteFileSync(encodePackageFileName(toFile, isEncodePackage), content);
  } else {
    return cpSync(fromFile, encodePackageFileName(toFile, isEncodePackage));
  }
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
export async function copyPath(pathFile: string, toPath: string, relativePath = '', ignoreFile = [] as Array<string | RegExp>, fileSetFunctions?: Record<string, (content: string) => string>, isEncodePackage = true) {
  if (!existsSync(pathFile)) {
    return;
  }
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
        await copyPath(path, toSetPath, relativeFilePath, ignoreFile, fileSetFunctions, isEncodePackage);
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

/**
 * 检测文件夹文件是否存在
 * @param pathFile
 * @param toPath
 * @param relativePath
 * @param hasFiles
 * @returns
 */
export function checkPathFile(pathFile: string, toPath: string, relativePath = '', hasFiles = [] as string[]) {
  if (!existsSync(pathFile)) {
    return [];
  }
  const fileList = readdirSync(pathFile);
  fileList.forEach((file) => {
    const relativeFilePath = join(relativePath, file).replaceAll('\\', '/');
    const path = resolve(pathFile, file);
    const toSetPath = resolve(toPath, file);
    if (!existsSync(toSetPath)) {
      return;
    }
    const stats = statSync(path);
    if (stats.isDirectory()) {
      //文件夹递归处理
      checkPathFile(path, toSetPath, relativeFilePath, hasFiles);
    } else {
      hasFiles.push(toSetPath);
    }
    return true;
  });
  return hasFiles;
}

/**
 * 异步地将指定文件夹压缩为 ZIP 文件，使用流式 API 以优化性能和内存使用。
 *
 * 此函数使用 fflate 库的 Zip 和 AsyncZipDeflate 类来流式构建 ZIP 归档。
 * 它会启动一个后台线程池来并行压缩多个文件，从而提高效率，尤其是在处理多个大文件时。
 * 文件内容通过流的方式读取和处理，避免一次性将所有文件加载到内存。
 *
 * @param {string} folderPath - 要压缩的源文件夹的路径。
 * @param {string} outputPath - 输出 ZIP 文件的目标路径。
 * @param {ZipOptions} [globalOptions={ level: 6 }] - 应用于所有文件的全局压缩选项。
 * @returns {Promise<void>} 一个 Promise，当 ZIP 文件成功写入磁盘时 resolve，
 *                          如果过程中发生错误则 reject。
 */
export async function zipFolderAsyncOptimized(folderPath: string, outputPath: string, globalOptions: DeflateOptions = { level: 6 }): Promise<void> {
  console.log(`开始优化压缩文件夹: ${folderPath} -> ${outputPath}`);

  // 获取文件列表的辅助函数
  function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = readdirSync(dirPath);
    files.forEach((file) => {
      const filePath = join(dirPath, file);
      if (statSync(filePath).isDirectory()) {
        getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(filePath);
      }
    });
    return arrayOfFiles;
  }

  const filePaths = getAllFiles(folderPath);
  console.log(`找到 ${filePaths.length} 个文件进行压缩。`);

  return new Promise<void>((resolve, reject) => {
    // 1. 创建主 ZIP 流实例
    const zipStream = new Zip();

    // 用于收集最终 ZIP 文件数据的数组
    const zipChunks: Uint8Array[] = [];

    // 2. 设置 ZIP 流的数据处理函数
    zipStream.ondata = (err: Error | null, chunk: Uint8Array, final: boolean) => {
      if (err) {
        console.error("ZIP 流处理出错:", err);
        // 如果出现错误，终止 ZIP 流并拒绝 Promise
        zipStream.terminate();
        reject(err);
        return;
      }
      // 将接收到的数据块添加到数组中
      zipChunks.push(chunk);

      if (final) {
        // 当收到最后一个数据块时，合并所有块并写入文件
        console.log("所有 ZIP 数据块接收完毕，正在写入文件...");
        try {
            const fullZipData = new Uint8Array(
                zipChunks.reduce((acc, chunk) => acc + chunk.length, 0)
            );
            let offset = 0;
            for (const chunk of zipChunks) {
              fullZipData.set(chunk, offset);
              offset += chunk.length;
            }
            writeFileSync(outputPath, fullZipData);
            console.log(`优化压缩完成: ${outputPath}`);
            resolve(); // 压缩成功
        } catch (writeErr) {
            console.error("写入 ZIP 文件失败:", writeErr);
            reject(writeErr);
        }
      }
    };

    // 3. 遍历文件，为每个文件创建 AsyncZipDeflate 流并添加到主 ZIP 流
    const addPromises = filePaths.map(filePath => {
      return new Promise<void>((fileResolve, fileReject) => {
        const relativePath = relative(folderPath, filePath).replace(/\\/g, '/');

        // 3a. 创建针对单个文件的异步压缩流
        // 使用 ZipOptions 作为构造函数的选项类型
        const fileDeflater = new AsyncZipDeflate(relativePath, globalOptions);

        // 3b. 设置单个文件流的数据处理函数
        fileDeflater.ondata = (err: Error | null, chunk: Uint8Array, final: boolean) => {
          if (err) {
            console.error(`压缩文件 ${relativePath} 时出错:`, err);
            // 出错时终止相关流并拒绝对应的 Promise
            fileDeflater.terminate();
            zipStream.terminate(); // 终止整个 ZIP 过程
            fileReject(err);
            return;
          }
          // 将单个文件压缩后的数据块推送到主 ZIP 流
          zipStream.add(fileDeflater);
          if (final) {
            console.log(`文件已添加并压缩: ${relativePath}`);
            fileResolve(); // 单个文件处理完成
          }
        };

        // 3c. 开始读取文件并推送到压缩流
        const fileReadStream = createReadStream(filePath);

        fileReadStream.on('data', (buffer: string | Buffer<ArrayBufferLike>) => {
          // 将读取到的 Buffer 推送到 AsyncZipDeflate 流进行压缩
          // 注意：push 的第二个参数 'false' 表示这不是最后一个数据块
          fileDeflater.push(buffer as Buffer<ArrayBufferLike> , false);
        });

        fileReadStream.on('end', () => {
          // 文件读取完毕，向 AsyncZipDeflate 流推送最后一个数据块标记
          // 传入空的 Uint8Array 并标记 final=true
          fileDeflater.push(new Uint8Array(), true);
        });

        fileReadStream.on('error', (err: Error) => {
          console.error(`读取文件 ${filePath} 时出错:`, err);
          fileDeflater.terminate();
          zipStream.terminate(); // 终止整个 ZIP 过程
          fileReject(err);
        });
      });
    });

    // 4. 等待所有文件都处理完毕
    Promise.all(addPromises)
      .then(() => {
        // 所有文件的读取和压缩流都已启动并标记结束
        // 现在通知主 ZIP 流结束归档
        console.log("所有文件流已添加，正在结束 ZIP 归档...");
        zipStream.end();
      })
      .catch((err) => {
        // 如果任何一个文件处理失败，则整个过程失败
        console.error("处理某个文件时失败，终止 ZIP 流:", err);
        zipStream.terminate();
        reject(err as Error);
      });
  });
}
