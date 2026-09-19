import { Zip, ZipDeflate, ZipPassThrough, type DeflateOptions, type ZipInputFile } from 'fflate';
import { createReadStream, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, WriteFileOptions, writeFileSync } from 'node:fs';
import { copyFile as copyFileAsync, lstat, open, opendir, realpath, rm } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { finished, pipeline } from 'node:stream/promises';

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
export async function copyFile(fromFile: string, toFile: string, fileSetFunction?: (content: string) => string | Promise<string>, isEncodePackage = true) {
  if (!existsSync(fromFile)) {
    return;
  }
  const target = encodePackageFileName(toFile, isEncodePackage);
  if (fileSetFunction) {
    // 转换 API 接收完整字符串，内存边界为单个待转换文件及其结果。
    const content = await fileSetFunction(readFileSync(fromFile, 'utf-8'));
    return recursionWriteFileSync(target, content);
  }
  mkdirSync(dirname(target), { recursive: true });
  return copyFileAsync(fromFile, target);
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
export async function copyPath(pathFile: string, toPath: string, relativePath = '', ignoreFile = [] as Array<string | RegExp>, fileSetFunctions?: Record<string, (content: string) => string | Promise<string>>, isEncodePackage = true) {
  if (!existsSync(pathFile)) {
    return;
  }
  const targetRoot = await resolveRealPath(toPath);
  const ancestors = new Set<string>();
  async function copyDirectory(source: string, target: string, prefix: string): Promise<Array<boolean | void>> {
    const sourceReal = await realpath(source);
    if (isPathInside(sourceReal, targetRoot) || isPathInside(targetRoot, sourceReal) || ancestors.has(sourceReal)) {
      throw new Error(`复制目录不能相互包含或形成循环: ${source} -> ${targetRoot}`);
    }
    ancestors.add(sourceReal);
    mkdirSync(target, { recursive: true });
    const results: Array<boolean | void> = [];
    try {
      for await (const file of await opendir(source)) {
        const relativeFilePath = join(prefix, file.name).replaceAll('\\', '/');
        const ignored = ignoreFile.some((item) => {
          if (typeof item === 'string') return item === relativeFilePath;
          item.lastIndex = 0;
          return item.test(relativeFilePath);
        });
        if (ignored) {
          results.push(undefined);
          continue;
        }
        const path = join(source, file.name);
        const toSetPath = join(target, file.name);
        const stats = statSync(path);
        if (stats.isDirectory()) {
          await copyDirectory(path, toSetPath, relativeFilePath);
          results.push(true);
        } else if (stats.isFile()) {
          const transform = fileSetFunctions && Object.hasOwn(fileSetFunctions, relativeFilePath) ? fileSetFunctions[relativeFilePath] : undefined;
          const result = await copyFile(path, toSetPath, transform, isEncodePackage);
          results.push(transform ? result : true);
        } else {
          throw new Error(`不支持复制特殊文件: ${path}`);
        }
      }
      return results;
    } finally {
      ancestors.delete(sourceReal);
    }
  }
  return copyDirectory(pathFile, toPath, relativePath);
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

function isPathInside(parent: string, child: string) {
  const path = relative(parent, child);
  return path === '' || (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}

// 解析尚不存在的目标路径，同时识别已有父目录中的软链接/junction。
async function resolveRealPath(path: string): Promise<string> {
  try {
    return await realpath(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    const parent = dirname(resolve(path));
    if (parent === resolve(path)) throw error;
    return join(await resolveRealPath(parent), relative(parent, resolve(path)));
  }
}

/**
 * 逐文件、逐块生成 ZIP，pipeline 将写盘背压传递到文件读取端。
 * 仅保留当前块和 ZIP 中央目录元数据；fflate 不支持 ZIP64，超限明确报错。
 */
export async function zipFolderAsyncOptimized(folderPath: string, outputPath: string, globalOptions: DeflateOptions = { level: 6 }): Promise<void> {
  const root = await realpath(folderPath);
  const output = await resolveRealPath(outputPath);
  if (isPathInside(root, output)) throw new Error('ZIP 输出不能位于源目录内');
  // 独占创建失败时不进入清理分支，绝不覆盖或删除已有文件。
  const handle = await open(outputPath, 'wx');
  const destination = handle.createWriteStream({ highWaterMark: 64 * 1024 });
  let activeRead: ReturnType<typeof createReadStream> | undefined;
  let chunks: Uint8Array[] = [];
  let zipError: Error | null = null;
  let bytes = 0;
  let entries = 0;
  const zip = new Zip((error, chunk) => {
    if (error) {
      zipError = error;
      return;
    }
    bytes += chunk.length;
    if (bytes >= 0xffffffff) {
      zipError = new Error('ZIP 大小超出 ZIP32 限制，需要 ZIP64');
      return;
    }
    chunks.push(chunk);
  });
  function* drainChunks() {
    if (zipError) throw zipError;
    const ready = chunks;
    chunks = [];
    yield* ready;
  }
  const ancestors = new Set<string>();
  async function* walk(path: string): AsyncGenerator<{ path: string; name: string; directory: boolean }> {
    const source = await realpath(path);
    if (isPathInside(source, output) || ancestors.has(source)) throw new Error(`压缩目录包含输出或形成循环: ${path}`);
    ancestors.add(source);
    try {
      for await (const file of await opendir(path)) {
        const fullPath = join(path, file.name);
        const stats = await lstat(fullPath);
        const name = relative(root, fullPath).replaceAll('\\', '/');
        if (name.split('/').some((part) => part === '..' || part === '') || isAbsolute(name)) throw new Error(`无效 ZIP 路径: ${name}`);
        if (stats.isSymbolicLink()) throw new Error(`压缩源不能包含软链接: ${fullPath}`);
        if (!stats.isFile() && !stats.isDirectory()) throw new Error(`不支持压缩特殊文件: ${fullPath}`);
        if (stats.size >= 0xffffffff) throw new Error(`文件超出 ZIP32 限制: ${fullPath}`);
        yield { path: fullPath, name: name + (stats.isDirectory() ? '/' : ''), directory: stats.isDirectory() };
        if (stats.isDirectory()) yield* walk(fullPath);
      }
    } finally {
      ancestors.delete(source);
    }
  }
  try {
    await pipeline(async function* ({ signal }: { signal?: AbortSignal } = {}) {
      for await (const file of walk(root)) {
        signal?.throwIfAborted();
        if (++entries >= 0xffff) throw new Error('ZIP 条目数超出 ZIP32 限制，需要 ZIP64');
        const deflater = file.directory ? new ZipPassThrough(file.name) : new ZipDeflate(file.name, globalOptions);
        // Zip 会保留条目至中央目录写完，不能让条目引用每个文件的压缩器及其缓冲。
        const entry: ZipInputFile = { filename: file.name, compression: deflater.compression, size: 0, crc: 0 };
        if (deflater instanceof ZipDeflate) entry.flag = deflater.flag;
        if (file.directory) entry.attrs = 0x10;
        zip.add(entry);
        deflater.ondata = (error, chunk, final) => {
          entry.size = deflater.size;
          entry.crc = deflater.crc;
          entry.ondata!(error, chunk, final);
        };
        yield* drainChunks();
        if (!file.directory) {
          const source = createReadStream(file.path, { highWaterMark: 64 * 1024, signal });
          activeRead = source;
          try {
            for await (const chunk of source) {
              signal?.throwIfAborted();
              deflater.push(chunk as Buffer, false);
              if (deflater.size >= 0xffffffff) throw new Error(`文件超出 ZIP32 限制: ${file.path}`);
              // 同步 push 只产出当前块；yield 消耗完后才继续读取，绝不排队整个文件。
              yield* drainChunks();
            }
          } finally {
            source.destroy();
            await finished(source).catch(() => {});
            activeRead = undefined;
          }
        }
        deflater.push(new Uint8Array(), true);
        yield* drainChunks();
      }
      zip.end();
      yield* drainChunks();
    }, destination);
  } catch (error) {
    activeRead?.destroy();
    destination.destroy();
    await finished(destination).catch(() => {});
    await handle.close();
    await rm(outputPath, { force: true });
    throw error;
  } finally {
    zip.terminate();
    await handle.close();
  }
}
