import assert from 'node:assert/strict';
import { createHash, randomFillSync } from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createInflateRaw } from 'node:zlib';
import test from 'node:test';
import { Command } from 'commander';
import { compressInit } from '../dist/commanders/compress.js';
import { copyFile, copyPath, zipFolderAsyncOptimized } from '../dist/utils/file.js';

const self = fileURLToPath(import.meta.url);
const MiB = 1024 * 1024;
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = (n >>> 1) ^ (n & 1 ? 0xedb88320 : 0);
  return n >>> 0;
});

async function fixture(t) {
  const root = await fsp.mkdtemp(join(tmpdir(), 'meadmin-compress-test-'));
  t.after(() => fsp.rm(root, { recursive: true, force: true }));
  return root;
}
async function put(path, content = '') {
  await fsp.mkdir(dirname(path), { recursive: true });
  await fsp.writeFile(path, content);
}
async function hash(path) {
  const digest = createHash('sha256');
  for await (const chunk of fs.createReadStream(path)) digest.update(chunk);
  return digest.digest('hex');
}
async function child(args, cwd, heap = false) {
  return new Promise((resolveChild, reject) => {
    const proc = spawn(process.execPath, [...(heap ? ['--max-old-space-size=96'] : []), self, ...args], { cwd, windowsHide: true });
    let stdout = '', stderr = '';
    proc.stdout.on('data', data => { stdout += data; });
    proc.stderr.on('data', data => { stderr += data; });
    proc.on('error', reject);
    proc.on('close', code => resolveChild({ code, stdout, stderr }));
  });
}

function commandError(result) {
  assert.equal(result.code, 1, result.stderr + result.stdout);
  const line = result.stdout.split('\n').find(line => line.startsWith('COMMAND_ERROR '));
  assert.ok(line, result.stderr + result.stdout);
  return JSON.parse(line.slice('COMMAND_ERROR '.length));
}
async function retainedDirectory(root, error) {
  const outputs = await fsp.readdir(root, { withFileTypes: true });
  const directories = outputs.filter(entry => entry.name.startsWith('dist_') && entry.isDirectory());
  assert.equal(directories.length, 1);
  const retained = join(await fsp.realpath(root), directories[0].name);
  assert.equal(error.message, `归档失败，临时目录已保留：${retained}`);
  assert.equal(error.cause?.name, 'Error');
  return retained;
}

// 用独立的 ZIP 中央目录解析及 Node zlib 解压，逐块检查大小、CRC 和 SHA256。
async function extract(zipPath, destination) {
  const handle = await fsp.open(zipPath, 'r');
  const read = async (position, length) => {
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await handle.read(buffer, 0, length, position);
    assert.equal(bytesRead, length);
    return buffer;
  };
  const entries = new Map();
  try {
    const size = (await handle.stat()).size;
    const end = await read(size - 22, 22);
    assert.equal(end.readUInt32LE(0), 0x06054b50);
    const count = end.readUInt16LE(10);
    assert.equal(end.readUInt16LE(8), count);
    let position = end.readUInt32LE(16);
    assert.equal(position + end.readUInt32LE(12), size - 22);
    for (let index = 0; index < count; index++) {
      const header = await read(position, 46);
      assert.equal(header.readUInt32LE(0), 0x02014b50);
      const nameLength = header.readUInt16LE(28);
      const name = (await read(position + 46, nameLength)).toString('utf8');
      assert.ok(!name.startsWith('/') && !name.includes('..') && !name.includes('\\'));
      assert.ok(!entries.has(name));
      const compressed = header.readUInt32LE(20);
      const uncompressed = header.readUInt32LE(24);
      const offset = header.readUInt32LE(42);
      const local = await read(offset, 30);
      assert.equal(local.readUInt32LE(0), 0x04034b50);
      assert.equal((await read(offset + 30, local.readUInt16LE(26))).toString('utf8'), name);
      if (/[^\x00-\x7f]/.test(name)) assert.ok(header.readUInt16LE(8) & 0x800);
      const start = offset + 30 + local.readUInt16LE(26) + local.readUInt16LE(28);
      const target = join(destination, name);
      let length = 0, crc = 0xffffffff;
      const digest = createHash('sha256');
      if (name.endsWith('/')) {
        assert.equal(uncompressed, 0);
        await fsp.mkdir(target, { recursive: true });
      } else {
        await fsp.mkdir(dirname(target), { recursive: true });
        const verify = new Transform({ transform(chunk, encoding, callback) {
          length += chunk.length;
          digest.update(chunk);
          for (const byte of chunk) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
          callback(null, chunk);
        } });
        const input = fs.createReadStream(zipPath, { start, end: start + compressed - 1 });
        const streams = header.readUInt16LE(10) === 8 ? [input, createInflateRaw(), verify] : [input, verify];
        await pipeline(...streams, fs.createWriteStream(target, { flags: 'wx' }));
      }
      assert.equal(length, uncompressed, name);
      assert.equal((crc ^ 0xffffffff) >>> 0, header.readUInt32LE(16), name);
      const descriptor = await read(start + compressed, 16);
      assert.equal(descriptor.readUInt32LE(0), 0x08074b50);
      assert.equal(descriptor.readUInt32LE(8), compressed);
      assert.equal(descriptor.readUInt32LE(12), uncompressed);
      entries.set(name, { size: length, hash: digest.digest('hex') });
      position += 46 + nameLength + header.readUInt16LE(30) + header.readUInt16LE(32);
    }
    assert.equal(position, size - 22);
    return entries;
  } finally {
    await handle.close();
  }
}

if (process.argv[2] === '--command') {
  process.chdir(process.argv[3]);
  const program = new Command();
  compressInit(program);
  const fault = process.argv[5];
  let originalError;
  const originalLstat = fsp.lstat;
  fsp.lstat = async (...args) => {
    try { return await originalLstat(...args); }
    catch (error) { originalError = error; throw error; }
  };
  if (fault === 'read') {
    const original = fs.createReadStream;
    originalError = new Error('fixture command read failure');
    fs.createReadStream = (...args) => {
      const stream = original(...args);
      stream.once('data', () => stream.destroy(originalError));
      return stream;
    };
  } else if (fault === 'write' || fault === 'collision') {
    const original = fsp.open;
    if (fault === 'write') originalError = new Error('fixture command write failure');
    fsp.open = async (...args) => {
      if (args[1] === 'wx' && fault === 'collision') await fsp.writeFile(args[0], '用户重名 ZIP', { flag: 'wx' });
      let handle;
      try { handle = await original(...args); }
      catch (error) { originalError = error; throw error; }
      if (args[1] === 'wx' && fault === 'write') {
        const create = handle.createWriteStream.bind(handle);
        handle.createWriteStream = options => {
          const stream = create(options);
          stream._write = (chunk, encoding, callback) => callback(originalError);
          stream._writev = (chunks, callback) => callback(originalError);
          return stream;
        };
      }
      return handle;
    };
  }
  syncBuiltinESMExports();
  try {
    await program.parseAsync(['compress', '-c', process.argv[4]], { from: 'user' });
  } catch (error) {
    const config = await import(pathToFileURL(join(process.cwd(), process.argv[4])).href);
    originalError ??= config.originalError;
    console.log('COMMAND_ERROR ' + JSON.stringify({
      message: error.message,
      cause: error.cause && { name: error.cause.name, message: error.cause.message, code: error.cause.code, path: error.cause.path },
      causeIsOriginal: originalError !== undefined && error.cause === originalError,
    }));
    console.error(error);
    process.exitCode = 1;
  }
} else if (process.argv[2] === '--large') {
  const root = process.argv[3];
  const peak = { rss: 0, heapUsed: 0, external: 0, arrayBuffers: 0 };
  const sample = () => {
    const memory = process.memoryUsage();
    for (const key of Object.keys(peak)) peak[key] = Math.max(peak[key], memory[key]);
  };
  const timer = setInterval(sample, 10);
  try {
    const source = join(root, 'source');
    await fsp.mkdir(source);
    const expected = new Map();
    for (let index = 0; index < 3; index++) {
      const name = `大文件-${index}.bin`;
      const handle = await fsp.open(join(source, name), 'wx');
      const chunk = Buffer.alloc(MiB);
      const digest = createHash('sha256');
      try {
        for (let block = 0; block < 128; block++) {
          randomFillSync(chunk);
          digest.update(chunk);
          await handle.write(chunk);
          sample();
        }
      } finally { await handle.close(); }
      expected.set(name, digest.digest('hex'));
    }
    await copyPath(source, join(root, 'copied'), '', [], undefined, false);
    for (const [name, digest] of expected) assert.equal(await hash(join(root, 'copied', name)), digest);
    const output = join(root, 'large.zip');
    await zipFolderAsyncOptimized(join(root, 'copied'), output);
    const entries = await extract(output, join(root, 'unpacked'));
    for (const [name, digest] of expected) {
      assert.equal(entries.get(name).hash, digest);
      assert.equal(entries.get(name).size, 128 * MiB);
      assert.equal(await hash(join(root, 'unpacked', name)), digest);
    }
    sample();
    assert.ok(peak.arrayBuffers < 96 * MiB, JSON.stringify(peak));
    assert.ok(peak.rss < 300 * MiB, JSON.stringify(peak));
    console.log(JSON.stringify({ inputBytes: 384 * MiB, zipBytes: (await fsp.stat(output)).size, heapLimitMiB: 96, peak, maxRSSKiB: process.resourceUsage().maxRSS, hashes: Object.fromEntries(expected) }));
  } finally { clearInterval(timer); }
} else {
  test('二进制、中文、空目录、多文件：独立解压并验证 CRC/SHA256 和相对路径', async t => {
    const root = await fixture(t);
    const source = join(root, 'source');
    await fsp.mkdir(join(source, '空目录'), { recursive: true });
    const expected = new Map();
    for (let index = 0; index < 180; index++) {
      const name = index === 0 ? '中文/二进制.bin' : `files/${index}.bin`;
      await put(join(source, name), index === 1 ? '' : randomFillSync(Buffer.alloc(4096 + index)));
      expected.set(name, await hash(join(source, name)));
    }
    await zipFolderAsyncOptimized(source, join(root, 'result.zip'));
    const entries = await extract(join(root, 'result.zip'), join(root, 'unpacked'));
    assert.ok(entries.has('空目录/'));
    assert.equal(entries.size, expected.size + 3);
    for (const [name, digest] of expected) assert.equal(entries.get(name).hash, digest);
  });

  test('空源目录生成合法空 ZIP', async t => {
    const root = await fixture(t);
    await fsp.mkdir(join(root, 'source'));
    await zipFolderAsyncOptimized(join(root, 'source'), join(root, 'empty.zip'));
    assert.equal((await extract(join(root, 'empty.zip'), join(root, 'unpacked'))).size, 0);
  });

  test('copy helper 保持编码 API、二进制内容、返回结果、ignore 和串行异步转换', async t => {
    const root = await fixture(t);
    const source = join(root, 'source'), target = join(root, 'target');
    const binary = Buffer.from([0, 255, 254, 128, 192, 10]);
    await put(join(source, 'binary.bin'), binary);
    await put(join(source, 'package.json'), '{"name":"fixture"}');
    await put(join(source, 'ignored.txt'), 'ignore');
    await put(join(source, 'skip-1.txt'), 'ignore');
    await put(join(source, 'skip-2.txt'), 'ignore');
    await fsp.mkdir(join(source, '空目录'));
    let active = 0, maxActive = 0;
    const transforms = {};
    for (let index = 0; index < 20; index++) {
      const name = `nested/${index}.txt`;
      await put(join(source, name), 'before');
      transforms[name] = async content => {
        maxActive = Math.max(maxActive, ++active);
        await new Promise(resolveTimer => setTimeout(resolveTimer, 2));
        active--;
        return content + ' after';
      };
    }
    assert.ok(Array.isArray(await copyPath(source, target, '', ['ignored.txt', /^skip-/g], transforms)));
    assert.equal(maxActive, 1);
    assert.deepEqual(await fsp.readFile(join(target, 'binary.bin')), binary);
    assert.equal(await fsp.readFile(join(target, 'nested/19.txt'), 'utf8'), 'before after');
    assert.ok(fs.existsSync(join(target, 'packageTemplate.json')));
    assert.ok(fs.existsSync(join(target, '空目录')));
    for (const name of ['ignored.txt', 'skip-1.txt', 'skip-2.txt']) assert.ok(!fs.existsSync(join(target, name)));
    await copyFile(join(target, 'packageTemplate.json'), join(root, 'decoded/packageTemplate.json'), undefined, false);
    assert.equal(await fsp.readFile(join(root, 'decoded/package.json'), 'utf8'), '{"name":"fixture"}');
    assert.equal(await copyFile(join(root, 'missing'), join(root, 'no-output')), undefined);
    assert.equal(await copyPath(join(root, 'missing'), join(root, 'no-output')), undefined);
  });

  test('命令仅处理 fixture：转换生效、路径语义、唯一目录和已有 ZIP 保护', async t => {
    const root = await fixture(t);
    await put(join(root, 'assets/中文.bin'), randomFillSync(Buffer.alloc(20000)));
    await fsp.mkdir(join(root, 'assets/empty'));
    await put(join(root, 'assets/config.txt'), 'before');
    await put(join(root, 'assets/ignored.txt'), 'ignore');
    await put(join(root, 'package.json'), '{"name":"fixture"}');
    await put(join(root, 'fixture.mjs'), `export default { 'assets/': { ignore: ['ignored.txt'], fileSetFunction: { 'config.txt': s => s + ' after' } }, 'package.json': s => s.replace('fixture', 'changed') };`);
    await put(join(root, 'existing.zip'), '用户既有 ZIP');
    const runs = await Promise.all([child(['--command', root, 'fixture.mjs'], root), child(['--command', root, 'fixture.mjs'], root)]);
    for (const result of runs) assert.equal(result.code, 0, result.stderr);
    const archives = (await fsp.readdir(root)).filter(name => /^dist_.*\.zip$/.test(name));
    assert.equal(archives.length, 2);
    assert.equal((await fsp.readdir(root)).filter(name => name.startsWith('dist_')).length, 2);
    const entries = await extract(join(root, archives[0]), join(root, 'unpacked'));
    assert.equal(entries.get('assets/中文.bin').hash, await hash(join(root, 'assets/中文.bin')));
    assert.equal(await fsp.readFile(join(root, 'unpacked/assets/config.txt'), 'utf8'), 'before after');
    assert.equal(await fsp.readFile(join(root, 'unpacked/package.json'), 'utf8'), '{"name":"changed"}');
    assert.ok(entries.has('assets/empty/'));
    assert.ok(!entries.has('assets/ignored.txt'));
    assert.equal(await fsp.readFile(join(root, 'existing.zip'), 'utf8'), '用户既有 ZIP');
  });

  test('路径校验在创建前失败；转换/缺失输入失败保留已复制内容与原始 cause', async t => {
    const root = await fixture(t);
    await put(join(root, 'existing.zip'), '用户既有 ZIP');
    const keys = ['../outside', '/absolute', 'C:/absolute', 'C:relative', './', 'nested/../../escape', '\\\\server\\share'];
    for (let index = 0; index < keys.length; index++) {
      const config = `bad-${index}.mjs`;
      await put(join(root, config), `export default { ${JSON.stringify(keys[index])}: {} };`);
      const error = commandError(await child(['--command', root, config], root));
      assert.match(error.message, /只允许项目内的相对路径/);
      assert.equal(error.cause, undefined);
      assert.equal((await fsp.readdir(root)).filter(name => name.startsWith('dist_')).length, 0);
      assert.equal(await fsp.readFile(join(root, 'existing.zip'), 'utf8'), '用户既有 ZIP');
    }
    for (const fault of ['transform', 'directory-transform', 'missing']) {
      const project = join(root, fault);
      const binary = randomFillSync(Buffer.alloc(20000));
      await put(join(project, 'copied/中文.bin'), binary);
      await put(join(project, 'copied/config.txt'), 'before');
      await fsp.mkdir(join(project, 'copied/empty'));
      await put(join(project, 'input.txt'), 'before');
      await put(join(project, 'pending/input.txt'), 'before');
      await put(join(project, 'later.txt'), '尚未复制');
      await put(join(project, 'existing.zip'), '用户既有 ZIP');
      const failure = fault === 'missing' ? `'missing.txt': {}`
        : fault === 'transform' ? `'input.txt': () => { throw originalError; }`
          : `'pending/': { fileSetFunction: { 'input.txt': async () => { throw originalError; } } }`;
      await put(join(project, 'fixture.mjs'), `export const originalError = new Error('转换失败');
export default { 'copied/': { fileSetFunction: { 'config.txt': s => s + ' after' } }, ${failure}, 'later.txt': {} };`);
      const error = commandError(await child(['--command', project, 'fixture.mjs'], project));
      const retained = await retainedDirectory(project, error);
      assert.equal(error.causeIsOriginal, true);
      if (fault === 'missing') {
        assert.equal(error.cause.code, 'ENOENT');
        assert.equal(error.cause.path, join(await fsp.realpath(project), 'missing.txt'));
      } else assert.equal(error.cause.message, '转换失败');
      assert.deepEqual(await fsp.readFile(join(retained, 'copied/中文.bin')), binary);
      assert.equal(await fsp.readFile(join(retained, 'copied/config.txt'), 'utf8'), 'before after');
      assert.ok((await fsp.stat(join(retained, 'copied/empty'))).isDirectory());
      for (const name of ['input.txt', 'pending/input.txt', 'missing.txt', 'later.txt']) assert.ok(!fs.existsSync(join(retained, name)));
      assert.equal(await fsp.readFile(join(project, 'input.txt'), 'utf8'), 'before');
      assert.equal(await fsp.readFile(join(project, 'pending/input.txt'), 'utf8'), 'before');
      assert.deepEqual((await fsp.readdir(project)).filter(name => name.endsWith('.zip')), ['existing.zip']);
      assert.equal(await fsp.readFile(join(project, 'existing.zip'), 'utf8'), '用户既有 ZIP');
    }
    await assert.rejects(copyPath(root, join(root, 'inside')), /包含/);
    await fsp.mkdir(join(root, 'source'));
    await assert.rejects(copyPath(join(root, 'source'), root), /包含/);
    await assert.rejects(zipFolderAsyncOptimized(root, join(root, 'nested.zip')), /源目录/);
    await assert.rejects(zipFolderAsyncOptimized(join(root, 'source'), join(root, 'existing.zip')), { code: 'EEXIST' });
    assert.equal(await fsp.readFile(join(root, 'existing.zip'), 'utf8'), '用户既有 ZIP');
  });

  test('命令压缩读写失败保留完整复制目录和原始 cause，清理不完整 ZIP 并保护重名 ZIP', async t => {
    const root = await fixture(t);
    for (const fault of ['read', 'write', 'collision']) {
      const project = join(root, fault);
      const binary = randomFillSync(Buffer.alloc(MiB));
      await put(join(project, 'source/input.bin'), binary);
      await put(join(project, 'source/nested/中文.txt'), 'before');
      await fsp.mkdir(join(project, 'source/empty'));
      await put(join(project, 'fixture.mjs'), `export default { 'source/': { fileSetFunction: { 'nested/中文.txt': s => s + ' after' } } };`);
      await put(join(project, 'existing.zip'), '用户既有 ZIP');
      const error = commandError(await child(['--command', project, 'fixture.mjs', fault], project));
      const retained = await retainedDirectory(project, error);
      assert.equal(error.causeIsOriginal, true);
      assert.deepEqual(await fsp.readFile(join(retained, 'source/input.bin')), binary);
      assert.equal(await fsp.readFile(join(retained, 'source/nested/中文.txt'), 'utf8'), 'before after');
      assert.ok((await fsp.stat(join(retained, 'source/empty'))).isDirectory());
      assert.deepEqual(await fsp.readFile(join(project, 'source/input.bin')), binary);
      assert.equal(await fsp.readFile(join(project, 'source/nested/中文.txt'), 'utf8'), 'before');
      const archives = (await fsp.readdir(project)).filter(name => name.startsWith('dist_') && name.endsWith('.zip'));
      if (fault === 'collision') {
        assert.equal(error.cause.code, 'EEXIST');
        assert.equal(error.cause.path, retained + '.zip');
        assert.equal(archives.length, 1);
        assert.equal(await fsp.readFile(retained + '.zip', 'utf8'), '用户重名 ZIP');
      } else {
        assert.equal(error.cause.message, `fixture command ${fault} failure`);
        assert.deepEqual(archives, []);
        assert.ok(!fs.existsSync(retained + '.zip'));
      }
      assert.equal(await fsp.readFile(join(project, 'existing.zip'), 'utf8'), '用户既有 ZIP');
    }
  });

  test('命令拒绝父路径 junction 越出 fixture 项目边界', async t => {
    const root = await fixture(t);
    const project = join(root, 'project');
    await put(join(root, 'outside/secret.txt'), 'fixture only');
    await fsp.mkdir(project);
    await fsp.symlink(join(root, 'outside'), join(project, 'alias'), 'junction');
    await put(join(project, 'fixture.mjs'), `export default { 'alias/secret.txt': {} };`);
    const error = commandError(await child(['--command', project, 'fixture.mjs'], project));
    const retained = await retainedDirectory(project, error);
    assert.match(error.cause.message, /源必须位于项目内/);
    assert.deepEqual(await fsp.readdir(retained), []);
    assert.equal((await fsp.readdir(project)).filter(name => name.endsWith('.zip')).length, 0);
    assert.equal(await fsp.readFile(join(root, 'outside/secret.txt'), 'utf8'), 'fixture only');
  });

  test('junction 循环和指向目标的目录不会递归自包含', async t => {
    const root = await fixture(t);
    const source = join(root, 'source'), target = join(root, 'target');
    await fsp.mkdir(source);
    await fsp.mkdir(target);
    await fsp.symlink(source, join(source, 'loop'), 'junction');
    await assert.rejects(copyPath(source, target), /循环/);
    await assert.rejects(zipFolderAsyncOptimized(source, join(root, 'bad.zip')), /软链接/);
    assert.ok(!fs.existsSync(join(root, 'bad.zip')));
    await fsp.unlink(join(source, 'loop'));
    await fsp.symlink(target, join(source, 'target-link'), 'junction');
    await assert.rejects(copyPath(source, target), /包含/);
    await fsp.symlink(source, join(root, 'alias'), 'junction');
    await assert.rejects(copyPath(source, join(root, 'alias/nested')), /包含/);
  });

  test('读流中途失败：关闭全部流并删除不完整 ZIP', async t => {
    const root = await fixture(t);
    await put(join(root, 'source/file.bin'), randomFillSync(Buffer.alloc(MiB)));
    const original = fs.createReadStream;
    let stream;
    t.mock.method(fs, 'createReadStream', (...args) => {
      stream = original(...args);
      stream.once('data', () => stream.destroy(new Error('fixture read failure')));
      return stream;
    });
    syncBuiltinESMExports();
    try {
      await assert.rejects(zipFolderAsyncOptimized(join(root, 'source'), join(root, 'bad.zip')), /fixture read failure/);
      assert.ok(stream.closed);
      assert.ok(!fs.existsSync(join(root, 'bad.zip')));
    } finally { t.mock.restoreAll(); syncBuiltinESMExports(); }
  });

  test('写流中途失败：立即停止读取、关闭流并删除不完整 ZIP', async t => {
    const root = await fixture(t);
    await put(join(root, 'source/file.bin'), randomFillSync(Buffer.alloc(4 * MiB)));
    const originalOpen = fsp.open, originalRead = fs.createReadStream;
    let destination, source, readBytes = 0;
    t.mock.method(fsp, 'open', async (...args) => {
      const handle = await originalOpen(...args);
      if (args[1] === 'wx') {
        const create = handle.createWriteStream.bind(handle);
        handle.createWriteStream = options => {
          destination = create(options);
          destination._write = (chunk, encoding, callback) => setImmediate(() => callback(new Error('fixture write failure')));
          destination._writev = (chunks, callback) => setImmediate(() => callback(new Error('fixture write failure')));
          return destination;
        };
      }
      return handle;
    });
    t.mock.method(fs, 'createReadStream', (...args) => {
      source = originalRead(...args);
      source.on('data', chunk => { readBytes += chunk.length; });
      return source;
    });
    syncBuiltinESMExports();
    try {
      await assert.rejects(zipFolderAsyncOptimized(join(root, 'source'), join(root, 'bad.zip')), /fixture write failure/);
      assert.ok(destination.closed);
      assert.ok(!source || source.closed);
      assert.ok(readBytes < MiB, String(readBytes));
      assert.ok(!fs.existsSync(join(root, 'bad.zip')));
    } finally { t.mock.restoreAll(); syncBuiltinESMExports(); }
  });

  test('慢写盘施加背压，同时最多一个文件读流', async t => {
    const root = await fixture(t);
    for (let index = 0; index < 3; index++) await put(join(root, `source/${index}.bin`), randomFillSync(Buffer.alloc(MiB)));
    const originalOpen = fsp.open, originalRead = fs.createReadStream;
    let readBytes = 0, writtenBytes = 0, maxAhead = 0, active = 0, maxActive = 0;
    t.mock.method(fsp, 'open', async (...args) => {
      const handle = await originalOpen(...args);
      if (args[1] === 'wx') {
        const create = handle.createWriteStream.bind(handle);
        handle.createWriteStream = options => {
          const stream = create(options), write = stream._write.bind(stream);
          stream._writev = undefined;
          stream._write = (chunk, encoding, callback) => setTimeout(() => write(chunk, encoding, error => {
            writtenBytes += chunk.length;
            callback(error);
          }), 2);
          return stream;
        };
      }
      return handle;
    });
    t.mock.method(fs, 'createReadStream', (...args) => {
      const stream = originalRead(...args);
      maxActive = Math.max(maxActive, ++active);
      stream.once('close', () => { active--; });
      stream.on('data', chunk => { readBytes += chunk.length; maxAhead = Math.max(maxAhead, readBytes - writtenBytes); });
      return stream;
    });
    syncBuiltinESMExports();
    try {
      await zipFolderAsyncOptimized(join(root, 'source'), join(root, 'slow.zip'));
      assert.equal(maxActive, 1);
      assert.equal(active, 0);
      assert.ok(maxAhead < 512 * 1024, String(maxAhead));
      t.diagnostic(`慢写盘最大读取领先量=${maxAhead} bytes，最大并发读流=${maxActive}`);
    } finally { t.mock.restoreAll(); syncBuiltinESMExports(); }
    const entries = await extract(join(root, 'slow.zip'), join(root, 'unpacked'));
    for (let index = 0; index < 3; index++) assert.equal(entries.get(`${index}.bin`).hash, await hash(join(root, `source/${index}.bin`)));
  });

  test('96 MiB 堆下复制/压缩/独立解压 3 × 128 MiB 随机二进制，验证 hash 与内存峰值', { timeout: 240000 }, async t => {
    const root = await fixture(t);
    const result = await child(['--large', root], root, true);
    assert.equal(result.code, 0, result.stderr + result.stdout);
    const metrics = JSON.parse(result.stdout.trim());
    assert.equal(Object.keys(metrics.hashes).length, 3);
    assert.ok(metrics.zipBytes > 380 * MiB);
    t.diagnostic(JSON.stringify(metrics));
  });
}
