// 仅同步 CMS 所属代码与资产，保护宿主项目的其他文件；不执行 SQL。
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../..');
const addonRoot = path.join(root, 'addons/cms');
const targets = [
  'src/app/admin/addons/cms',
  'src/app/index/addons/cms',
  'view/admin/src/addons/cms',
  'view/index/src/addons/cms',
  // CMS 前台依赖主 layout 的 menus/active 属性与头部菜单溢出折叠能力，
  // 这两个文件属于插件随包交付的宿主文件（此前漏配，导致模板长期停留在旧版本）
  'view/index/src/layout/default/components/header/index.vue',
  'view/index/src/layout/default/components/header/components/navMenu.vue',
  // CMS 异步表单页依赖宿主路由视图的即时空白 fallback，避免切换时保留并重绘首页。
  'view/index/src/layout/default/page.vue',
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
