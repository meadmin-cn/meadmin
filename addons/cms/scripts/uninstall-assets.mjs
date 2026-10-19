// 卸载 CMS 自包含公共资源：按 manifest 删除已安装到 public/ 的示例下载文件与封面。
// 仅删除清单内文件，不触碰宿主其他文件。
import fs from 'node:fs';
import path from 'node:path';

const addonRoot = path.resolve(import.meta.dirname, '..');
const projectRoot = path.resolve(addonRoot, '../..');
const destinationRoot = path.join(projectRoot, 'public');
const manifestPath = path.join(addonRoot, 'assets', 'manifest.json');
const removed = [];
const missing = [];

if (!fs.existsSync(manifestPath)) {
  throw new Error(`CMS 资源清单不存在: ${manifestPath}`);
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
  const target = path.resolve(destinationRoot, normalized);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { force: true });
    removed.push(normalized);
  } else {
    missing.push(normalized);
  }
}

// 清理被清空的目录（从叶子向上，仅删除 CMS 相关空目录）
for (const dir of ['public/files', 'public/index/images/cms']) {
  const p = path.resolve(projectRoot, dir);
  try {
    if (fs.existsSync(p) && fs.readdirSync(p).length === 0) {
      fs.rmdirSync(p);
    }
  } catch {
    /* 忽略非空或权限错误 */
  }
}

console.log(`CMS 资源卸载完成：删除 ${removed.length} 个，已不存在 ${missing.length} 个`);
