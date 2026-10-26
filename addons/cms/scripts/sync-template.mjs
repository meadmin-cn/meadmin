// 仅同步 CMS 所属代码与资产，保护宿主项目的其他文件；不执行 SQL。
// 原则：template/ 里只能有插件自有文件（src/app/*/addons/cms、src/entities/aonCms*.entity.ts、
// view/*/src/addons/cms）。宿主框架文件（如 view/index/src/layout/**）一律不进模板——
// CMS 用到的 Header menus/active、菜单溢出折叠、路由切换空白 fallback 都是框架能力，
// 由 @meadmin/core（>= 1.3.16）提供，插件安装不得覆盖项目根文件。
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../..');
const addonRoot = path.join(root, 'addons/cms');
const targets = [
  'src/app/admin/addons/cms',
  'src/app/index/addons/cms',
  'view/admin/src/addons/cms',
  'view/index/src/addons/cms',
  ...fs
    .readdirSync(path.join(root, 'src/entities'))
    .filter((name) => /^aonCms.*\.entity\.ts$/.test(name))
    .map((name) => 'src/entities/' + name),
];
for (const relative of targets) {
  const source = path.join(root, relative);
  const dest = path.join(addonRoot, 'template', relative);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(source, dest, { recursive: true });
}

const manifestPath = path.join(addonRoot, 'assets/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
if (!Array.isArray(manifest.public)) throw new Error(`CMS 资源清单无效: ${manifestPath}`);
for (const relative of manifest.public) {
  const source = path.join(root, 'public', relative);
  const dest = path.join(addonRoot, 'assets/public', relative);
  if (!fs.existsSync(source)) continue;
  if (!fs.statSync(source).isFile()) throw new Error(`CMS 资源不是普通文件: ${source}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
}

// 注意：install.sql / uninstall.sql 为插件安装/卸载入口，独立维护，不在此处覆盖。
// install.sql 由 .workbuddy/scripts/{dump-cms-schema,export-cms-seed,assemble-install}.cjs 从线上库重建（表结构 + 菜单 + 演示数据）。
console.log('CMS 模板与资产同步完成；未执行数据库操作');
