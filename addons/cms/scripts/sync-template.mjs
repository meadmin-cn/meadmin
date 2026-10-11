// 仅同步 CMS 所属文件，保护宿主项目的其他文件；不执行 SQL。
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '../../..');
const targets = [
  'src/app/admin/addons/cms',
  'src/app/index/addons/cms',
  'view/admin/src/addons/cms',
  'view/index/src/addons/cms',
  'public/index/images/cms',
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
  const dest = path.join(root, 'addons/cms/template', relative);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(path.join(root, relative), dest, { recursive: true });
}
fs.copyFileSync(path.join(root, 'database/migration/20260920_cms_install.sql'), path.join(root, 'addons/cms/install.sql'));
console.log('CMS 模板同步完成；未执行数据库操作');
