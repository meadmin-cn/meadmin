// 安装 CMS 自包含公共资源；已有宿主文件一律保留，不执行删除或覆盖。
import fs from 'node:fs';
import path from 'node:path';

const addonRoot = path.resolve(import.meta.dirname, '..');
const projectRoot = path.resolve(addonRoot, '../..');
const sourceRoot = path.join(addonRoot, 'assets', 'public');
const destinationRoot = path.join(projectRoot, 'public');
const manifestPath = path.join(addonRoot, 'assets', 'manifest.json');
const copied = [];
const skipped = [];

if (!fs.existsSync(sourceRoot)) {
  throw new Error(`CMS 资源目录不存在: ${sourceRoot}`);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (!Array.isArray(manifest.public)) {
  throw new Error(`CMS 资源清单无效: ${manifestPath}`);
}

function assertRelativePath(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  const resolved = path.resolve(destinationRoot, relativePath);
  const root = path.resolve(destinationRoot) + path.sep;
  if (!normalized || normalized.startsWith('/') || normalized.split('/').includes('..') || !resolved.startsWith(root)) {
    throw new Error(`CMS 资源路径无效: ${relativePath}`);
  }
  return normalized;
}

for (const relativePath of manifest.public) {
  const normalized = assertRelativePath(relativePath);
  const sourcePath = path.resolve(sourceRoot, relativePath);
  const destinationPath = path.resolve(destinationRoot, relativePath);
  const sourceStats = fs.lstatSync(sourcePath, { throwIfNoEntry: false });
  if (!sourceStats?.isFile()) {
    throw new Error(`CMS 资源清单文件不存在或不是普通文件: ${sourcePath}`);
  }
  if (fs.existsSync(destinationPath)) {
    skipped.push(normalized);
    continue;
  }
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  try {
    fs.copyFileSync(sourcePath, destinationPath, fs.constants.COPYFILE_EXCL);
    copied.push(normalized);
  } catch (error) {
    if (error?.code === 'EEXIST') {
      skipped.push(normalized);
      continue;
    }
    throw error;
  }
}

console.log(`CMS 资源安装完成：复制 ${copied.length} 个，保留已有 ${skipped.length} 个`);
