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
