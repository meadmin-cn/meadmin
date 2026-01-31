/*
 Navicat Premium Data Transfer

 Source Server         : meadmin
 Source Server Type    : PostgreSQL
 Source Server Version : 160001
 Source Host           : 101.43.145.113:5432
 Source Catalog        : meadmin
 Source Schema         : meadmin

 Target Server Type    : PostgreSQL
 Target Server Version : 160001
 File Encoding         : 65001

 Date: 31/01/2026 18:44:21
*/


-- ----------------------------
-- Table structure for admin_role
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."admin_role";
CREATE TABLE "meadmin"."admin_role" (
  "system_role_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "system_admin_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of admin_role
-- ----------------------------
INSERT INTO "meadmin"."admin_role" VALUES ('635392868638261248', '604612615536115712');
INSERT INTO "meadmin"."admin_role" VALUES ('635419305097297920', '632899190933946368');
INSERT INTO "meadmin"."admin_role" VALUES ('635419444721483776', '632899190933946368');

-- ----------------------------
-- Table structure for example_book
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."example_book";
CREATE TABLE "meadmin"."example_book" (
  "id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "created_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) NOT NULL,
  "updated_at" timestamptz(6) NOT NULL
)
;
COMMENT ON COLUMN "meadmin"."example_book"."name" IS '名称';
COMMENT ON COLUMN "meadmin"."example_book"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "meadmin"."example_book"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "meadmin"."example_book"."created_at" IS '创建时间';
COMMENT ON COLUMN "meadmin"."example_book"."updated_at" IS '最后更新时间';
COMMENT ON TABLE "meadmin"."example_book" IS '示例_书籍';

-- ----------------------------
-- Records of example_book
-- ----------------------------
INSERT INTO "meadmin"."example_book" VALUES ('1', '平凡的世界', '604612615536115712', '604612615536115712', '2026-01-08 15:16:13+08', '2026-01-08 15:16:17+08');
INSERT INTO "meadmin"."example_book" VALUES ('2', '钢铁是怎样练成的', '604612615536115712', '604612615536115712', '2026-01-08 15:17:01+08', '2026-01-08 15:17:04+08');
INSERT INTO "meadmin"."example_book" VALUES ('3', '基督山伯爵', '604612615536115712', '604612615536115712', '2026-01-08 15:17:23+08', '2026-01-08 15:17:26+08');
INSERT INTO "meadmin"."example_book" VALUES ('4', '西游记', '604612615536115712', '604612615536115712', '2026-01-08 15:17:44+08', '2026-01-08 15:17:47+08');
INSERT INTO "meadmin"."example_book" VALUES ('5', '水浒传', '604612615536115712', '604612615536115712', '2026-01-08 15:18:07+08', '2026-01-08 15:18:09+08');
INSERT INTO "meadmin"."example_book" VALUES ('6', '红楼梦', '604612615536115712', '604612615536115712', '2026-01-08 15:18:28+08', '2026-01-08 15:18:30+08');
INSERT INTO "meadmin"."example_book" VALUES ('7', '三国演绎', '604612615536115712', '604612615536115712', '2026-01-08 15:18:48+08', '2026-01-08 15:18:51+08');

-- ----------------------------
-- Table structure for example_demo
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."example_demo";
CREATE TABLE "meadmin"."example_demo" (
  "id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "created_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) NOT NULL,
  "updated_at" timestamptz(6) NOT NULL,
  "mobile" varchar(11) COLLATE "pg_catalog"."default",
  "type" int2 NOT NULL DEFAULT 0,
  "user_id" varchar(20) COLLATE "pg_catalog"."default",
  "avatar_file_id" varchar(20) COLLATE "pg_catalog"."default",
  "deleted_at" timestamptz(6)
)
;
COMMENT ON COLUMN "meadmin"."example_demo"."name" IS '名称';
COMMENT ON COLUMN "meadmin"."example_demo"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "meadmin"."example_demo"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "meadmin"."example_demo"."created_at" IS '创建时间';
COMMENT ON COLUMN "meadmin"."example_demo"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "meadmin"."example_demo"."mobile" IS '手机号';
COMMENT ON COLUMN "meadmin"."example_demo"."type" IS '类型:0=书籍;1=电子产品;2=卡片';
COMMENT ON COLUMN "meadmin"."example_demo"."user_id" IS '关联前台用户id';
COMMENT ON COLUMN "meadmin"."example_demo"."avatar_file_id" IS '头像附件id';
COMMENT ON COLUMN "meadmin"."example_demo"."deleted_at" IS '删除时间';
COMMENT ON TABLE "meadmin"."example_demo" IS '示例_Demo';

-- ----------------------------
-- Records of example_demo
-- ----------------------------
INSERT INTO "meadmin"."example_demo" VALUES ('664043217833951232', '测试', '604612615536115712', '604612615536115712', '2026-01-07 17:50:40.459+08', '2026-01-08 20:53:13.587+08', '13333333333', 0, '657558079876890624', '646151944066301952', NULL);

-- ----------------------------
-- Table structure for example_demo_books
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."example_demo_books";
CREATE TABLE "meadmin"."example_demo_books" (
  "example_book_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "example_demo_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of example_demo_books
-- ----------------------------
INSERT INTO "meadmin"."example_demo_books" VALUES ('1', '664043217833951232');
INSERT INTO "meadmin"."example_demo_books" VALUES ('2', '664043217833951232');
INSERT INTO "meadmin"."example_demo_books" VALUES ('3', '664043217833951232');

-- ----------------------------
-- Table structure for example_demo_files
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."example_demo_files";
CREATE TABLE "meadmin"."example_demo_files" (
  "file_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "example_demo_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of example_demo_files
-- ----------------------------
INSERT INTO "meadmin"."example_demo_files" VALUES ('639448903602667520', '664043217833951232');
INSERT INTO "meadmin"."example_demo_files" VALUES ('644498186374742016', '664043217833951232');
INSERT INTO "meadmin"."example_demo_files" VALUES ('640524238482046976', '664043217833951232');
INSERT INTO "meadmin"."example_demo_files" VALUES ('646269163429429248', '664043217833951232');
INSERT INTO "meadmin"."example_demo_files" VALUES ('646155434071162880', '664043217833951232');
INSERT INTO "meadmin"."example_demo_files" VALUES ('639466180326719488', '664043217833951232');
INSERT INTO "meadmin"."example_demo_files" VALUES ('664481511247970304', '664043217833951232');

-- ----------------------------
-- Table structure for file
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."file";
CREATE TABLE "meadmin"."file" (
  "id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(300) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "mime_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "size" int4,
  "storage" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'storage'::character varying,
  "created_at" timestamptz(6) NOT NULL,
  "updated_at" timestamptz(6) NOT NULL,
  "created_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "path" varchar(200) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "md5" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying
)
;
COMMENT ON COLUMN "meadmin"."file"."name" IS '文件名';
COMMENT ON COLUMN "meadmin"."file"."mime_type" IS 'mime类型';
COMMENT ON COLUMN "meadmin"."file"."size" IS '文件大小(b)';
COMMENT ON COLUMN "meadmin"."file"."storage" IS '存储引擎';
COMMENT ON COLUMN "meadmin"."file"."created_at" IS '创建时间';
COMMENT ON COLUMN "meadmin"."file"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "meadmin"."file"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "meadmin"."file"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "meadmin"."file"."path" IS '路径';
COMMENT ON COLUMN "meadmin"."file"."md5" IS '文件MD5值';
COMMENT ON TABLE "meadmin"."file" IS '附件表';

-- ----------------------------
-- Table structure for role_menu
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."role_menu";
CREATE TABLE "meadmin"."role_menu" (
  "system_menu_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "system_role_id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of role_menu
-- ----------------------------
INSERT INTO "meadmin"."role_menu" VALUES ('1', '635419305097297920');
INSERT INTO "meadmin"."role_menu" VALUES ('2', '635419305097297920');
INSERT INTO "meadmin"."role_menu" VALUES ('3', '635419305097297920');
INSERT INTO "meadmin"."role_menu" VALUES ('3', '635424437604188160');

-- ----------------------------
-- Table structure for system_admin
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."system_admin";
CREATE TABLE "meadmin"."system_admin" (
  "id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "username" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "nickname" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "password" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "salt" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "email" varchar(100) COLLATE "pg_catalog"."default",
  "mobile" varchar(11) COLLATE "pg_catalog"."default",
  "login_failure" int2 NOT NULL DEFAULT 0,
  "last_login_at" timestamptz(6),
  "last_login_ip" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "status" int2 NOT NULL DEFAULT 1,
  "created_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "deleted_at" timestamptz(6),
  "created_at" timestamptz(6) NOT NULL,
  "updated_at" timestamptz(6) NOT NULL,
  "avatar_file_id" varchar(20) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "meadmin"."system_admin"."username" IS '用户名';
COMMENT ON COLUMN "meadmin"."system_admin"."nickname" IS '昵称';
COMMENT ON COLUMN "meadmin"."system_admin"."password" IS '密码';
COMMENT ON COLUMN "meadmin"."system_admin"."salt" IS '密码盐';
COMMENT ON COLUMN "meadmin"."system_admin"."email" IS '邮箱';
COMMENT ON COLUMN "meadmin"."system_admin"."mobile" IS '手机号';
COMMENT ON COLUMN "meadmin"."system_admin"."login_failure" IS '登录失败次数';
COMMENT ON COLUMN "meadmin"."system_admin"."last_login_at" IS '登录时间';
COMMENT ON COLUMN "meadmin"."system_admin"."last_login_ip" IS '登录ip';
COMMENT ON COLUMN "meadmin"."system_admin"."status" IS '状态:1=启用;0=禁用';
COMMENT ON COLUMN "meadmin"."system_admin"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "meadmin"."system_admin"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "meadmin"."system_admin"."deleted_at" IS '删除时间';
COMMENT ON COLUMN "meadmin"."system_admin"."created_at" IS '创建时间';
COMMENT ON COLUMN "meadmin"."system_admin"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "meadmin"."system_admin"."avatar_file_id" IS '头像附件id';
COMMENT ON TABLE "meadmin"."system_admin" IS '管理员表';

-- ----------------------------
-- Records of system_admin
-- ----------------------------
INSERT INTO "meadmin"."system_admin" VALUES ('632899190933946368', 'Test', 'test', 'ec7cb37e4c73af64cd2fd5b7e844ae1b8931acb4b1ebe555f2f2eefe33c831fe', 'de80c6206e17adf184a36c7e0840f01f', NULL, '15555555555', 0, NULL, '', 1, '604612615536115712', '604612615536115712', NULL, '2025-10-13 19:15:25.818+08', '2026-01-09 18:20:28.746+08', '646269352819032064');
INSERT INTO "meadmin"."system_admin" VALUES ('604612615536115712', 'admin', 'Admin', 'e8e51c59da6333bce7a443efc3e8e2e792ac6b5592a70523a16b074ba1dcc3c0', 'd06d09e00fbb3ed98f6ce1f004be912c', 'admin@outlock.com', '13333333333', 0, '2026-01-16 18:04:20.681+08', '::ffff:127.0.0.1', 1, '604612615536115712', '604612615536115712', NULL, '2025-07-27 17:54:40.704+08', '2026-01-16 18:04:20.681+08', '646270698863460352');

-- ----------------------------
-- Table structure for system_menu
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."system_menu";
CREATE TABLE "meadmin"."system_menu" (
  "id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "title" varchar(100) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "menu_type" int2 NOT NULL,
  "status" int2 NOT NULL DEFAULT 1,
  "rule" varchar(100) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "order_num" int2 NOT NULL DEFAULT 0,
  "path" varchar(500) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "is_link" int2 NOT NULL DEFAULT 0,
  "component" varchar(500) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "hide_menu" int2 NOT NULL DEFAULT 0,
  "cache" int2 NOT NULL DEFAULT 0,
  "icon" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "affix" int2 NOT NULL DEFAULT 0,
  "always_show" int2 NOT NULL DEFAULT 0,
  "breadcrumb" int2 NOT NULL DEFAULT 1,
  "parent_id" varchar(100) COLLATE "pg_catalog"."default",
  "left" int8,
  "right" int8,
  "lock_version" varchar(100) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "created_at" timestamptz(6) NOT NULL,
  "updated_at" timestamptz(6) NOT NULL,
  "created_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_admin_id" varchar(20) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "meadmin"."system_menu"."title" IS '菜单名称';
COMMENT ON COLUMN "meadmin"."system_menu"."menu_type" IS '类型:1=目录;2=菜单;3=按钮';
COMMENT ON COLUMN "meadmin"."system_menu"."status" IS '状态:1=启用;0=禁用';
COMMENT ON COLUMN "meadmin"."system_menu"."rule" IS '权限';
COMMENT ON COLUMN "meadmin"."system_menu"."order_num" IS '排序(降序)';
COMMENT ON COLUMN "meadmin"."system_menu"."path" IS '路径';
COMMENT ON COLUMN "meadmin"."system_menu"."is_link" IS '外链:1=是;0=否';
COMMENT ON COLUMN "meadmin"."system_menu"."component" IS '组件路径(相对于views文件夹)';
COMMENT ON COLUMN "meadmin"."system_menu"."hide_menu" IS '隐藏:1=是;0=否';
COMMENT ON COLUMN "meadmin"."system_menu"."cache" IS '缓存:1=是;0=否';
COMMENT ON COLUMN "meadmin"."system_menu"."icon" IS '图标';
COMMENT ON COLUMN "meadmin"."system_menu"."affix" IS '固定tag:1=是;0=否';
COMMENT ON COLUMN "meadmin"."system_menu"."always_show" IS '恒定展示(只有一个子元素时不隐藏):1=是;0=否';
COMMENT ON COLUMN "meadmin"."system_menu"."breadcrumb" IS '面包屑:1=展示;0=不展示';
COMMENT ON COLUMN "meadmin"."system_menu"."parent_id" IS '父级id';
COMMENT ON COLUMN "meadmin"."system_menu"."left" IS '左树边界';
COMMENT ON COLUMN "meadmin"."system_menu"."right" IS '右树边界';
COMMENT ON COLUMN "meadmin"."system_menu"."lock_version" IS '锁版本号';
COMMENT ON COLUMN "meadmin"."system_menu"."created_at" IS '创建时间';
COMMENT ON COLUMN "meadmin"."system_menu"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "meadmin"."system_menu"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "meadmin"."system_menu"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON TABLE "meadmin"."system_menu" IS '菜单表';

-- ----------------------------
-- Records of system_menu
-- ----------------------------
INSERT INTO "meadmin"."system_menu" VALUES ('664816035819421696', '新增', 3, 1, 'user_file_add', 97, '', 0, '', 0, 0, '', 0, 0, 1, '664816034456272896', 61, 62, '', '2026-01-09 21:01:34.624+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664816036259823616', '编辑', 3, 1, 'user_file_edit', 96, '', 0, '', 0, 0, '', 0, 0, 1, '664816034456272896', 63, 64, '', '2026-01-09 21:01:34.729+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664816034456272896', '前台附件', 2, 1, 'user_file', 998, 'user/file', 0, 'user/file/index', 0, 0, '', 0, 0, 1, '664816340996980736', 56, 67, '', '2026-01-09 21:01:34.3+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664813414475890688', '用户管理', 2, 1, 'user', 997, '/user', 0, 'user/index', 0, 0, '', 0, 0, 1, NULL, 81, 92, '', '2026-01-09 20:51:09.647+08', '2026-01-16 18:32:59.102+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664813415100841984', '列表', 3, 1, 'user_list', 99, '', 0, '', 0, 0, '', 0, 0, 1, '664813414475890688', 82, 83, '', '2026-01-09 20:51:09.796+08', '2026-01-16 18:32:59.102+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664813415503495168', '详情', 3, 1, 'user_info', 98, '', 0, '', 0, 0, '', 0, 0, 1, '664813414475890688', 84, 85, '', '2026-01-09 20:51:09.892+08', '2026-01-16 18:32:59.102+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664813415910342656', '新增', 3, 1, 'user_add', 97, '', 0, '', 0, 0, '', 0, 0, 1, '664813414475890688', 86, 87, '', '2026-01-09 20:51:09.989+08', '2026-01-16 18:32:59.102+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664813416312995840', '编辑', 3, 1, 'user_edit', 96, '', 0, '', 0, 0, '', 0, 0, 1, '664813414475890688', 88, 89, '', '2026-01-09 20:51:10.085+08', '2026-01-16 18:32:59.102+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664813416715649024', '删除', 3, 1, 'user_del', 95, '', 0, '', 0, 0, '', 0, 0, 1, '664813414475890688', 90, 91, '', '2026-01-09 20:51:10.181+08', '2026-01-16 18:32:59.102+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664799640041816064', '列表', 3, 1, 'system_role_list', 99, '', 0, '', 0, 1, '', 0, 0, 1, '664798918835437568', 28, 29, '', '2026-01-09 19:56:25.566+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664799999699189760', '编辑', 3, 1, 'system_role_edit', 96, '', 0, '', 0, 1, '', 0, 0, 1, '664798918835437568', 34, 35, '', '2026-01-09 19:57:51.316+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664816034934423552', '列表', 3, 1, 'user_file_list', 99, '', 0, '', 0, 0, '', 0, 0, 1, '664816034456272896', 57, 58, '', '2026-01-09 21:01:34.413+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664816036704419840', '删除', 3, 1, 'user_file_del', 95, '', 0, '', 0, 0, '', 0, 0, 1, '664816034456272896', 65, 66, '', '2026-01-09 21:01:34.835+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664816035383214080', '详情', 3, 1, 'user_file_info', 98, '', 0, '', 0, 0, '', 0, 0, 1, '664816034456272896', 59, 60, '', '2026-01-09 21:01:34.52+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664033966474395648', '列表', 3, 1, 'example_demo_list', 99, '', 0, '', 0, 0, '', 0, 0, 1, '664033966046576640', 43, 44, '', '2026-01-07 17:13:54.762+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664033966889631744', '详情', 3, 1, 'example_demo_info', 98, '', 0, '', 0, 0, '', 0, 0, 1, '664033966046576640', 45, 46, '', '2026-01-07 17:13:54.862+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('639418081101217792', '管理员附件', 2, 1, 'file', 999, 'file', 0, 'file/index', 0, 1, '', 0, 0, 1, '664816340996980736', 68, 79, '', '2025-10-31 18:59:10.348+08', '2026-01-16 18:32:59.036+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664803191971381248', '删除', 3, 1, 'file_del', 95, '', 0, '', 0, 1, '', 0, 0, 1, '639418081101217792', 75, 76, '', '2026-01-09 20:10:32.412+08', '2026-01-16 18:32:59.036+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664802952766029824', '编辑', 3, 1, 'file_edit', 96, '', 0, '', 0, 1, '', 0, 0, 1, '639418081101217792', 77, 78, '', '2026-01-09 20:09:35.381+08', '2026-01-16 18:32:59.036+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664798399022759936', '详情', 3, 1, 'system_admin_info', 98, '', 0, '', 0, 1, '', 0, 0, 1, '2', 3, 4, '', '2026-01-09 19:51:29.684+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664799196632580096', '菜单', 3, 1, 'system_menu', 98, '', 0, '', 0, 1, '', 0, 0, 1, '3', 15, 26, '', '2026-01-09 19:54:39.849+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664802471784218624', '列表', 3, 1, 'file_list', 99, '', 0, '', 0, 1, '', 0, 0, 1, '639418081101217792', 69, 70, '', '2026-01-09 20:07:40.707+08', '2026-01-16 18:32:59.036+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664816340996980736', '附件管理', 1, 1, 'file_manage', 998, 'fileManage', 0, '', 0, 1, '', 0, 0, 1, NULL, 55, 80, '', '2026-01-09 21:02:47.384+08', '2026-01-16 18:32:59.036+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664797436325134336', '新增', 3, 1, 'system_menu_add', 97, '', 0, '', 0, 1, '', 0, 0, 1, '664799196632580096', 16, 17, '', '2026-01-09 19:47:40.16+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('1', '系统设置', 1, 1, 'system', 999, '/system', 0, '', 0, 0, '', 0, 0, 1, NULL, 1, 40, '', '2025-07-31 15:20:29+08', '2026-01-09 21:02:06.329+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('658270653836689408', '新增', 3, 1, 'system_admin_add', 97, '', 0, '', 0, 1, '', 0, 0, 1, '2', 7, 8, '', '2025-12-22 19:32:33.952+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('658270767712043008', '编辑', 3, 1, 'system_admin_edit', 96, '', 0, '', 0, 1, '', 0, 0, 1, '2', 9, 10, '', '2025-12-22 19:33:01.102+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664797552121479168', '编辑', 3, 1, 'system_menu_edit', 96, '', 0, '', 0, 1, '', 0, 0, 1, '664799196632580096', 22, 23, '', '2026-01-09 19:48:07.767+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('658270533162369024', '列表', 3, 1, 'system_admin_list', 99, '', 0, '', 0, 1, '', 0, 0, 1, '2', 5, 6, '', '2025-12-22 19:32:05.181+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('658270899723567104', '删除', 3, 1, 'system_admin_del', 95, '', 0, '', 0, 1, '', 0, 0, 1, '2', 11, 12, '', '2025-12-22 19:33:32.576+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664797875221299200', '详情', 3, 1, 'system_menu_info', 98, '', 0, '', 0, 1, '', 0, 0, 1, '664799196632580096', 20, 21, '', '2026-01-09 19:49:24.8+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664798918835437568', '角色组', 3, 1, 'system_role', 99, '', 0, '', 0, 1, '', 0, 0, 1, '3', 27, 38, '', '2026-01-09 19:53:33.617+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664797660825255936', '删除', 3, 1, 'system_menu_del', 95, '', 0, '', 0, 1, '', 0, 0, 1, '664799196632580096', 18, 19, '', '2026-01-09 19:48:33.684+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664797278774493184', '列表', 3, 1, 'system_menu_list', 99, '', 0, '', 0, 1, '', 0, 0, 1, '664799196632580096', 24, 25, '', '2026-01-09 19:47:02.598+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('3', '菜单权限', 2, 1, 'system_menu_role', 0, '/system/menu', 0, 'system/menuRole/index', 0, 0, '', 0, 0, 1, '1', 14, 39, '', '2025-07-31 15:20:29+08', '2026-01-09 21:02:06.329+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664033967292284928', '新增', 3, 1, 'example_demo_add', 97, '', 0, '', 0, 0, '', 0, 0, 1, '664033966046576640', 47, 48, '', '2026-01-07 17:13:54.958+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664033965581008896', '示例', 1, 1, 'example', 996, '/example', 0, '', 0, 0, '', 0, 1, 1, NULL, 41, 54, '', '2026-01-07 17:13:54.549+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664033968131145728', '删除', 3, 1, 'example_demo_del', 95, '', 0, '', 0, 0, '', 0, 0, 1, '664033966046576640', 49, 50, '', '2026-01-07 17:13:55.158+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664033966046576640', 'Demo', 2, 1, 'example_demo', 999, '/example/demo', 0, 'example/demo/index', 0, 0, '', 0, 0, 1, '664033965581008896', 42, 53, '', '2026-01-07 17:13:54.66+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664033967724298240', '编辑', 3, 1, 'example_demo_edit', 96, '', 0, '', 0, 0, '', 0, 0, 1, '664033966046576640', 51, 52, '', '2026-01-07 17:13:55.06+08', '2026-01-16 18:32:59.036+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664803080839102464', '新增', 3, 1, 'file_add', 97, '', 0, '', 0, 1, '', 0, 0, 1, '639418081101217792', 73, 74, '', '2026-01-09 20:10:05.916+08', '2026-01-16 18:32:59.036+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664802570002235392', '详情', 3, 1, 'file_info', 98, '', 0, '', 0, 1, '', 0, 0, 1, '639418081101217792', 71, 72, '', '2026-01-09 20:08:04.123+08', '2026-01-16 18:32:59.036+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664800095295766528', '删除', 3, 1, 'system_role_del', 95, '', 0, '', 0, 1, '', 0, 0, 1, '664798918835437568', 36, 37, '', '2026-01-09 19:58:14.107+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664799846128943104', '新增', 3, 1, 'system_role_add', 97, '', 0, '', 0, 1, '', 0, 0, 1, '664798918835437568', 32, 33, '', '2026-01-09 19:57:14.701+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('2', '管理员', 2, 1, 'system_admin', 99, '/system/admin', 0, 'system/admin/index', 0, 0, '', 0, 0, 1, '1', 2, 13, '', '2025-07-31 15:20:29+08', '2026-01-09 21:02:06.329+08', NULL, '604612615536115712');
INSERT INTO "meadmin"."system_menu" VALUES ('664799732303921152', '详情', 3, 1, 'system_role_info', 98, '', 0, '', 0, 1, '', 0, 0, 1, '664798918835437568', 30, 31, '', '2026-01-09 19:56:47.563+08', '2026-01-09 21:02:06.329+08', '604612615536115712', '604612615536115712');

-- ----------------------------
-- Table structure for system_role
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."system_role";
CREATE TABLE "meadmin"."system_role" (
  "id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "role_name" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "role_key" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "order_num" int2 NOT NULL DEFAULT 0,
  "status" int2 NOT NULL DEFAULT 1,
  "remark" varchar(100) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "parent_id" varchar(100) COLLATE "pg_catalog"."default",
  "left" int8,
  "right" int8,
  "lock_version" varchar(100) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "created_at" timestamptz(6) NOT NULL,
  "updated_at" timestamptz(6) NOT NULL,
  "created_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "is_super" int2 NOT NULL DEFAULT 0
)
;
COMMENT ON COLUMN "meadmin"."system_role"."role_name" IS '角色名称';
COMMENT ON COLUMN "meadmin"."system_role"."role_key" IS '角色标识';
COMMENT ON COLUMN "meadmin"."system_role"."order_num" IS '排序(降序)';
COMMENT ON COLUMN "meadmin"."system_role"."status" IS '状态:1=启用;0=禁用';
COMMENT ON COLUMN "meadmin"."system_role"."remark" IS '备注';
COMMENT ON COLUMN "meadmin"."system_role"."parent_id" IS '父级id';
COMMENT ON COLUMN "meadmin"."system_role"."left" IS '左树边界';
COMMENT ON COLUMN "meadmin"."system_role"."right" IS '右树边界';
COMMENT ON COLUMN "meadmin"."system_role"."lock_version" IS '锁版本号';
COMMENT ON COLUMN "meadmin"."system_role"."created_at" IS '创建时间';
COMMENT ON COLUMN "meadmin"."system_role"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "meadmin"."system_role"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "meadmin"."system_role"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "meadmin"."system_role"."is_super" IS '超级管理员:1=是;0=不是';
COMMENT ON TABLE "meadmin"."system_role" IS '角色表';

-- ----------------------------
-- Records of system_role
-- ----------------------------
INSERT INTO "meadmin"."system_role" VALUES ('635419444721483776', '三级管理员2', 'three_admin3', 997, 1, '', '635419154098159616', 3, 4, '', '2025-10-20 18:10:01.144+08', '2026-01-09 18:24:01.833+08', '604612615536115712', '604612615536115712', 0);
INSERT INTO "meadmin"."system_role" VALUES ('635419686065930240', '三级管理员', 'three_admin', 999, 1, '', '635419154098159616', 5, 6, '', '2025-10-20 18:10:58.686+08', '2026-01-09 18:24:01.833+08', '604612615536115712', '604612615536115712', 0);
INSERT INTO "meadmin"."system_role" VALUES ('635424437604188160', '三级管理员1', 'three_admin1', 0, 1, '', '635419154098159616', 7, 8, '', '2025-10-20 18:29:51.54+08', '2026-01-09 18:24:01.833+08', '604612615536115712', '604612615536115712', 0);
INSERT INTO "meadmin"."system_role" VALUES ('635419154098159616', '二级管理员', 'tow_admin', 999, 1, '', '635392868638261248', 2, 9, '', '2025-10-20 18:08:51.855+08', '2026-01-09 18:24:01.833+08', '604612615536115712', '604612615536115712', 0);
INSERT INTO "meadmin"."system_role" VALUES ('635392868638261248', '超级管理员', 'super_admin', 999, 1, '', '', 1, 12, '', '2025-10-20 16:24:24.912+08', '2026-01-09 18:24:01.862+08', '604612615536115712', '604612615536115712', 1);
INSERT INTO "meadmin"."system_role" VALUES ('635419305097297920', '二级管理员2', 'tow_admin2', 998, 1, '', '635392868638261248', 10, 11, '', '2025-10-20 18:09:27.855+08', '2026-01-09 18:24:01.891+08', '604612615536115712', '604612615536115712', 0);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."user";
CREATE TABLE "meadmin"."user" (
  "id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "username" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "nickname" varchar(20) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "password" varchar(64) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "salt" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "avatar_file_id" varchar(20) COLLATE "pg_catalog"."default",
  "email" varchar(100) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying,
  "mobile" varchar(11) COLLATE "pg_catalog"."default" DEFAULT NULL::character varying,
  "login_failure" int2 NOT NULL DEFAULT 0,
  "last_login_at" timestamptz(6),
  "last_login_ip" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "status" int2 NOT NULL DEFAULT 1,
  "deleted_at" timestamptz(6),
  "created_at" timestamptz(6) NOT NULL,
  "updated_at" timestamptz(6) NOT NULL,
  "created_user_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_user_id" varchar(20) COLLATE "pg_catalog"."default",
  "created_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_admin_id" varchar(20) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "meadmin"."user"."username" IS '用户名';
COMMENT ON COLUMN "meadmin"."user"."nickname" IS '昵称';
COMMENT ON COLUMN "meadmin"."user"."password" IS '密码';
COMMENT ON COLUMN "meadmin"."user"."salt" IS '密码盐';
COMMENT ON COLUMN "meadmin"."user"."avatar_file_id" IS '头像附件id';
COMMENT ON COLUMN "meadmin"."user"."email" IS '邮箱';
COMMENT ON COLUMN "meadmin"."user"."mobile" IS '手机号';
COMMENT ON COLUMN "meadmin"."user"."login_failure" IS '登录失败次数';
COMMENT ON COLUMN "meadmin"."user"."last_login_at" IS '登录时间';
COMMENT ON COLUMN "meadmin"."user"."last_login_ip" IS '登录ip';
COMMENT ON COLUMN "meadmin"."user"."status" IS '状态:1=启用;0=禁用';
COMMENT ON COLUMN "meadmin"."user"."deleted_at" IS '删除时间';
COMMENT ON COLUMN "meadmin"."user"."created_at" IS '创建时间';
COMMENT ON COLUMN "meadmin"."user"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "meadmin"."user"."created_user_id" IS '创建者(用户)Id';
COMMENT ON COLUMN "meadmin"."user"."updated_user_id" IS '最后更新者(用户)Id';
COMMENT ON COLUMN "meadmin"."user"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "meadmin"."user"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON TABLE "meadmin"."user" IS '用户表';

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO "meadmin"."user" VALUES ('657558079876890624', 'test', '测试账户', '0872954db1998fff1a92b4ff42f8f9aeb2932e67d0c7fb96e31dfa3db3504ec5', 'c10ebfb00d8075bb9045d74b3affc81e', '657559929984385024', '1111@qq.com', NULL, 0, NULL, '', 1, NULL, '2025-12-20 20:21:03.082+08', '2026-01-02 17:23:59.702+08', NULL, NULL, NULL, NULL);
INSERT INTO "meadmin"."user" VALUES ('657559945822076928', 'test1', '测试账户', '2716e588736572a6bf2d9cbb06067b52805ccd80557ff03715d4eda151467903', '7ddb011fdb2406e9b57c963aa0737d92', '667311085061144576', NULL, NULL, 0, NULL, '', 1, NULL, '2025-12-20 20:28:27.957+08', '2026-01-16 18:29:07.6+08', NULL, NULL, NULL, '604612615536115712');

-- ----------------------------
-- Table structure for user_file
-- ----------------------------
DROP TABLE IF EXISTS "meadmin"."user_file";
CREATE TABLE "meadmin"."user_file" (
  "id" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar(300) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "path" varchar(200) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "mime_type" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "size" int4,
  "storage" varchar(50) COLLATE "pg_catalog"."default" NOT NULL DEFAULT 'storage'::character varying,
  "md5" varchar(32) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
  "created_user_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_user_id" varchar(20) COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6) NOT NULL,
  "updated_at" timestamptz(6) NOT NULL,
  "created_admin_id" varchar(20) COLLATE "pg_catalog"."default",
  "updated_admin_id" varchar(20) COLLATE "pg_catalog"."default"
)
;
COMMENT ON COLUMN "meadmin"."user_file"."name" IS '文件名';
COMMENT ON COLUMN "meadmin"."user_file"."path" IS '路径';
COMMENT ON COLUMN "meadmin"."user_file"."mime_type" IS 'mime类型';
COMMENT ON COLUMN "meadmin"."user_file"."size" IS '文件大小(b)';
COMMENT ON COLUMN "meadmin"."user_file"."storage" IS '存储引擎';
COMMENT ON COLUMN "meadmin"."user_file"."md5" IS '文件MD5值';
COMMENT ON COLUMN "meadmin"."user_file"."created_user_id" IS '创建者(用户)Id';
COMMENT ON COLUMN "meadmin"."user_file"."updated_user_id" IS '最后更新者(用户)Id';
COMMENT ON COLUMN "meadmin"."user_file"."created_at" IS '创建时间';
COMMENT ON COLUMN "meadmin"."user_file"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "meadmin"."user_file"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "meadmin"."user_file"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON TABLE "meadmin"."user_file" IS '用户附件表(前台)';

-- ----------------------------
-- Primary Key structure for table admin_role
-- ----------------------------
ALTER TABLE "meadmin"."admin_role" ADD CONSTRAINT "admin_role_pkey" PRIMARY KEY ("system_role_id", "system_admin_id");

-- ----------------------------
-- Primary Key structure for table example_book
-- ----------------------------
ALTER TABLE "meadmin"."example_book" ADD CONSTRAINT "example_book_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table example_demo
-- ----------------------------
CREATE UNIQUE INDEX "example_demo_mobile_unique" ON "meadmin"."example_demo" USING btree (
  "mobile" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE NOT deleted_at IS NULL;

-- ----------------------------
-- Primary Key structure for table example_demo
-- ----------------------------
ALTER TABLE "meadmin"."example_demo" ADD CONSTRAINT "example_demo_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table example_demo_books
-- ----------------------------
ALTER TABLE "meadmin"."example_demo_books" ADD CONSTRAINT "example_demo_books_pkey" PRIMARY KEY ("example_book_id", "example_demo_id");

-- ----------------------------
-- Primary Key structure for table example_demo_files
-- ----------------------------
ALTER TABLE "meadmin"."example_demo_files" ADD CONSTRAINT "example_demo_files_pkey" PRIMARY KEY ("file_id", "example_demo_id");

-- ----------------------------
-- Primary Key structure for table file
-- ----------------------------
ALTER TABLE "meadmin"."file" ADD CONSTRAINT "file_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table role_menu
-- ----------------------------
ALTER TABLE "meadmin"."role_menu" ADD CONSTRAINT "role_menu_pkey" PRIMARY KEY ("system_menu_id", "system_role_id");

-- ----------------------------
-- Indexes structure for table system_admin
-- ----------------------------
CREATE UNIQUE INDEX "system_admin_email_unique" ON "meadmin"."system_admin" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX "system_admin_mobile_unique" ON "meadmin"."system_admin" USING btree (
  "mobile" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX "system_admin_username_unique" ON "meadmin"."system_admin" USING btree (
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NOT NULL;

-- ----------------------------
-- Primary Key structure for table system_admin
-- ----------------------------
ALTER TABLE "meadmin"."system_admin" ADD CONSTRAINT "system_admin_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table system_menu
-- ----------------------------
CREATE UNIQUE INDEX "systemAdminRule" ON "meadmin"."system_menu" USING btree (
  "rule" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "system_menu_rule_unique" ON "meadmin"."system_menu" USING btree (
  "rule" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table system_menu
-- ----------------------------
ALTER TABLE "meadmin"."system_menu" ADD CONSTRAINT "system_menu_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table system_role
-- ----------------------------
CREATE UNIQUE INDEX "system_role_role_key_unique" ON "meadmin"."system_role" USING btree (
  "role_key" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table system_role
-- ----------------------------
ALTER TABLE "meadmin"."system_role" ADD CONSTRAINT "system_role_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table user
-- ----------------------------
CREATE UNIQUE INDEX "user_email_unique" ON "meadmin"."user" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX "user_mobile_unique" ON "meadmin"."user" USING btree (
  "mobile" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NOT NULL;
CREATE UNIQUE INDEX "user_username_unique" ON "meadmin"."user" USING btree (
  "username" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
) WHERE deleted_at IS NOT NULL;

-- ----------------------------
-- Primary Key structure for table user
-- ----------------------------
ALTER TABLE "meadmin"."user" ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table user_file
-- ----------------------------
ALTER TABLE "meadmin"."user_file" ADD CONSTRAINT "user_file_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table admin_role
-- ----------------------------
ALTER TABLE "meadmin"."admin_role" ADD CONSTRAINT "admin_role_system_admin_id_fkey" FOREIGN KEY ("system_admin_id") REFERENCES "meadmin"."system_admin" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meadmin"."admin_role" ADD CONSTRAINT "admin_role_system_role_id_fkey" FOREIGN KEY ("system_role_id") REFERENCES "meadmin"."system_role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table example_demo
-- ----------------------------
ALTER TABLE "meadmin"."example_demo" ADD CONSTRAINT "example_demo_avatar_file_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "meadmin"."file" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "meadmin"."example_demo" ADD CONSTRAINT "example_demo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "meadmin"."user" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table role_menu
-- ----------------------------
ALTER TABLE "meadmin"."role_menu" ADD CONSTRAINT "role_menu_system_menu_id_fkey" FOREIGN KEY ("system_menu_id") REFERENCES "meadmin"."system_menu" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meadmin"."role_menu" ADD CONSTRAINT "role_menu_system_role_id_fkey" FOREIGN KEY ("system_role_id") REFERENCES "meadmin"."system_role" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table system_admin
-- ----------------------------
ALTER TABLE "meadmin"."system_admin" ADD CONSTRAINT "system_admin_avatar_file_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "meadmin"."file" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table system_menu
-- ----------------------------
ALTER TABLE "meadmin"."system_menu" ADD CONSTRAINT "system_menu_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "meadmin"."system_menu" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ----------------------------
-- Foreign Keys structure for table user
-- ----------------------------
ALTER TABLE "meadmin"."user" ADD CONSTRAINT "user_avatar_file_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "meadmin"."user_file" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
