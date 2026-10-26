-- CMS 插件卸载脚本：删除全部 CMS 表（含演示数据）与后台权限菜单。
-- 由 `npx meadmin addon cms --rm` 自动执行；静态资源由 uninstallShells 中的 uninstall-assets.mjs 清理。
-- schema 由连接决定（DATABASE_SCHEMA 会写进 search_path），这里不要写死；
-- 手动执行请先 `SET search_path TO <你的 schema>;`。

-- 删除 CMS 全部表（演示数据随之清除）
DROP TABLE IF EXISTS aon_cms_comment_report;
DROP TABLE IF EXISTS aon_cms_comment;
DROP TABLE IF EXISTS aon_cms_review_log;
DROP TABLE IF EXISTS aon_cms_order_log;
DROP TABLE IF EXISTS aon_cms_order;
DROP TABLE IF EXISTS aon_cms_diyform_data;
DROP TABLE IF EXISTS aon_cms_diyform;
DROP TABLE IF EXISTS aon_cms_article;
DROP TABLE IF EXISTS aon_cms_page;
DROP TABLE IF EXISTS aon_cms_block;
DROP TABLE IF EXISTS aon_cms_topic;
DROP TABLE IF EXISTS aon_cms_tag;
DROP TABLE IF EXISTS aon_cms_category;

-- 删除后台 CMS 菜单（父菜单 rule=addons_cms，其余均为 aon_cms_* 前缀）
DELETE FROM system_menu WHERE rule = 'addons_cms' OR rule LIKE 'aon_cms%';
