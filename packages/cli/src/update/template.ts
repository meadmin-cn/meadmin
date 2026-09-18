import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

export function versionParts(version: string): number[] {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error(`仅支持准确的 x.y.z 稳定版本号：${version}`);
  const parts = version.split('.').map(Number);
  if (parts.some((part) => !Number.isSafeInteger(part))) throw new Error('版本号超出安全范围');
  return parts;
}
export function compareVersions(a: string, b: string): number {
  const av = versionParts(a),
    bv = versionParts(b);
  return av[0] - bv[0] || av[1] - bv[1] || av[2] - bv[2];
}
export function currentVersion(root: string): string {
  if (!existsSync(join(root, 'node_modules/@meadmin/core/package.json'))) throw new Error('目标项目尚未安装本地 @meadmin/core，请先安装项目依赖');
  const require = createRequire(join(root, 'package.json'));
  let location: string;
  try {
    location = require.resolve('@meadmin/core');
  } catch {
    throw new Error('项目尚未安装 @meadmin/core，请先安装项目依赖。');
  }
  let directory = dirname(location);
  while (directory !== dirname(directory)) {
    const file = join(directory, 'package.json');
    if (existsSync(file)) {
      const pkg = JSON.parse(readFileSync(file, 'utf8'));
      if (pkg.name === '@meadmin/core') {
        versionParts(pkg.version);
        return pkg.version;
      }
    }
    directory = dirname(directory);
  }
  throw new Error('无法读取项目本地 @meadmin/core 版本');
}
export function selectVersion(current: string, versions: Record<string, { deprecated?: string }>, requested?: string): string {
  versionParts(current);
  const target =
    requested ??
    Object.keys(versions)
      .filter((v) => /^\d+\.\d+\.\d+$/.test(v) && versionParts(v)[0] === versionParts(current)[0] && !versions[v].deprecated)
      .sort(compareVersions)
      .at(-1);
  if (!target || !versions[target]) throw new Error('没有可用的目标版本');
  versionParts(target);
  if (versions[target].deprecated) throw new Error('目标版本已废弃');
  if (compareVersions(target, current) < 0) throw new Error('不支持降级');
  return target;
}
export type RegistryManifest = { versions: Record<string, { deprecated?: string; dist: { tarball: string; integrity?: string; shasum?: string } }> };
export async function registryManifest(registry: string): Promise<RegistryManifest> {
  const url = new URL(registry);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) throw new Error('registry 必须使用 HTTPS');
  const response = await fetch(registry.replace(/\/$/, '') + '/create-meadminjs', { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`模板元数据读取失败：HTTP ${response.status}`);
  return response.json() as Promise<RegistryManifest>;
}
/** 安全的 npm tar 子集解包；不支持的扩展和链接直接拒绝，不跟随符号链接。 */
export function unpackTemplate(archive: Buffer, destination: string): void {
  const tar = gunzipSync(archive, { maxOutputLength: 256 * 1024 * 1024 });
  const seen = new Set<string>();
  for (let offset = 0; offset + 512 <= tar.length; ) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const text = (start: number, length: number) =>
      header
        .subarray(start, start + length)
        .toString('utf8')
        .split('\0')[0];
    const stored = parseInt(text(148, 8).trim(), 8);
    const checksum = header.reduce((sum, byte, index) => sum + (index >= 148 && index < 156 ? 32 : byte), 0);
    if (stored !== checksum) throw new Error('tar header 校验失败');
    const size = parseInt(text(124, 12).trim() || '0', 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > tar.length) throw new Error('tar 长度无效');
    const name = [text(345, 155), text(0, 100)].filter(Boolean).join('/').replace(/\/$/, '');
    if (!name.startsWith('package/') && name !== 'package') throw new Error('压缩包包含非 package 路径');
    if (name.includes('\\') || name.split('/').some((part) => part === '..' || part === '.' || part.includes(':'))) throw new Error('压缩包路径不安全');
    const type = text(156, 1);
    if (!['', '0', '5'].includes(type)) throw new Error(`不支持的 tar 条目类型 ${type}，需人工检查`);
    const key = name.toLowerCase();
    if (seen.has(key)) throw new Error(`压缩包路径重复：${name}`);
    seen.add(key);
    const path = resolve(destination, name);
    if (type === '5') mkdirSync(path, { recursive: true });
    else {
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, tar.subarray(offset + 512, offset + 512 + size));
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
}
export async function downloadTemplate(manifest: RegistryManifest, version: string, destination: string): Promise<string> {
  const release = manifest.versions[version];
  if (!release) throw new Error(`缺少旧/目标模板 ${version}，升级停止`);
  const { dist } = release;
  const downloadUrl = new URL(dist.tarball);
  if (downloadUrl.protocol !== 'https:' && !(downloadUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(downloadUrl.hostname))) throw new Error('模板下载必须使用 HTTPS（本机测试registry除外）');
  const response = await fetch(dist.tarball, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`下载失败：${version}`);
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (!response.body) throw new Error('模板响应为空');
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 64 * 1024 * 1024) throw new Error('模板压缩包超过64MB限制');
    chunks.push(chunk);
  }
  const archive = Buffer.concat(chunks);
  const integrity = dist.integrity?.split(/\s+/).find((x) => x.startsWith('sha512-'));
  if (integrity) {
    if (createHash('sha512').update(archive).digest('base64') !== integrity.slice(7)) throw new Error('模板完整性校验失败');
  } else if (!dist.shasum || createHash('sha1').update(archive).digest('hex') !== dist.shasum) throw new Error('缺少有效模板完整性校验');
  unpackTemplate(archive, destination);
  const pkg = JSON.parse(readFileSync(join(destination, 'package/package.json'), 'utf8'));
  if (pkg.name !== 'create-meadminjs' || pkg.version !== version) throw new Error('模板包名称或版本不匹配');
  const template = join(destination, 'package/template/meadmin');
  if (!existsSync(join(template, 'packageTemplate.json'))) throw new Error('模板根目录无效');
  return template;
}
