-- meadmin 数据库结构与初始数据
-- 生成时间: 2026-10-23 09:13:41
-- 来源: meadmin（schema: meadmin）
-- 已排除插件表: aon_cms_article、aon_cms_block、aon_cms_category、aon_cms_comment、aon_cms_comment_report、aon_cms_diyform、aon_cms_diyform_data、aon_cms_order、aon_cms_order_log、aon_cms_page、aon_cms_review_log、aon_cms_tag、aon_cms_topic、aon_doc、aon_doc_config
-- 已排除插件菜单: 82 条（addons_cms、addons_doc）
-- 菜单左右边界已按 parent_id 重新计算
-- 已移除模式名前缀，可直接导入任意 schema

CREATE TABLE "admin_role" (
  "system_admin_id" character varying(20) NOT NULL,
  "system_role_id" character varying(20) NOT NULL,
  CONSTRAINT "admin_role_pkey" PRIMARY KEY (system_admin_id, system_role_id)
);
INSERT INTO "admin_role" ("system_admin_id", "system_role_id") VALUES ('604612615536115712', '635392868638261248'), ('632899190933946368', '635419305097297920'), ('632899190933946368', '635419444721483776');

CREATE TABLE "example_book" (
  "id" character varying(20) NOT NULL,
  "name" character varying(20) NOT NULL DEFAULT ''::character varying,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  CONSTRAINT "example_book_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "example_book" IS '示例_书籍';
COMMENT ON COLUMN "example_book"."name" IS '名称';
COMMENT ON COLUMN "example_book"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "example_book"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "example_book"."created_at" IS '创建时间';
COMMENT ON COLUMN "example_book"."updated_at" IS '最后更新时间';
INSERT INTO "example_book" ("id", "name", "created_admin_id", "updated_admin_id", "created_at", "updated_at") VALUES ('1', '平凡的世界', '604612615536115712', '604612615536115712', '2026-01-08 07:16:13+00', '2026-01-08 07:16:17+00'), ('2', '钢铁是怎样练成的', '604612615536115712', '604612615536115712', '2026-01-08 07:17:01+00', '2026-01-08 07:17:04+00'), ('3', '基督山伯爵', '604612615536115712', '604612615536115712', '2026-01-08 07:17:23+00', '2026-01-08 07:17:26+00'), ('4', '西游记', '604612615536115712', '604612615536115712', '2026-01-08 07:17:44+00', '2026-01-08 07:17:47+00'), ('5', '水浒传', '604612615536115712', '604612615536115712', '2026-01-08 07:18:07+00', '2026-01-08 07:18:09+00'), ('6', '红楼梦', '604612615536115712', '604612615536115712', '2026-01-08 07:18:28+00', '2026-01-08 07:18:30+00'), ('7', '三国演绎', '604612615536115712', '604612615536115712', '2026-01-08 07:18:48+00', '2026-01-08 07:18:51+00');

CREATE TABLE "example_demo" (
  "id" character varying(20) NOT NULL,
  "name" character varying(20) NOT NULL DEFAULT ''::character varying,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  "mobile" character varying(11),
  "type" smallint NOT NULL DEFAULT 0,
  "user_id" character varying(20),
  "avatar_file_id" character varying(20),
  "deleted_at" timestamp(6) with time zone,
  CONSTRAINT "example_demo_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "example_demo" IS '示例_Demo';
COMMENT ON COLUMN "example_demo"."name" IS '名称';
COMMENT ON COLUMN "example_demo"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "example_demo"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "example_demo"."created_at" IS '创建时间';
COMMENT ON COLUMN "example_demo"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "example_demo"."mobile" IS '手机号';
COMMENT ON COLUMN "example_demo"."type" IS '类型:0=书籍;1=电子产品;2=卡片';
COMMENT ON COLUMN "example_demo"."user_id" IS '关联前台用户id';
COMMENT ON COLUMN "example_demo"."avatar_file_id" IS '头像附件id';
COMMENT ON COLUMN "example_demo"."deleted_at" IS '删除时间';
INSERT INTO "example_demo" ("id", "name", "created_admin_id", "updated_admin_id", "created_at", "updated_at", "mobile", "type", "user_id", "avatar_file_id", "deleted_at") VALUES ('664043217833951232', '测试', '604612615536115712', '604612615536115712', '2026-01-07 09:50:40.459+00', '2026-01-08 12:53:13.587+00', '13333333333', '0', '657558079876890624', '646151944066301952', NULL);
CREATE UNIQUE INDEX example_demo_mobile_unique ON example_demo USING btree (mobile) WHERE (NOT (deleted_at IS NULL));

CREATE TABLE "example_demo_books" (
  "example_book_id" character varying(20) NOT NULL,
  "example_demo_id" character varying(20) NOT NULL,
  CONSTRAINT "example_demo_books_pkey" PRIMARY KEY (example_book_id, example_demo_id)
);
INSERT INTO "example_demo_books" ("example_book_id", "example_demo_id") VALUES ('1', '664043217833951232');

CREATE TABLE "example_demo_files" (
  "file_id" character varying(20) NOT NULL,
  "example_demo_id" character varying(20) NOT NULL,
  CONSTRAINT "example_demo_files_pkey" PRIMARY KEY (file_id, example_demo_id)
);
INSERT INTO "example_demo_files" ("file_id", "example_demo_id") VALUES ('639448903602667520', '664043217833951232'), ('639466180326719488', '664043217833951232'), ('640524238482046976', '664043217833951232'), ('644498186374742016', '664043217833951232'), ('646155434071162880', '664043217833951232'), ('646269163429429248', '664043217833951232'), ('664481511247970304', '664043217833951232');

CREATE TABLE "file" (
  "id" character varying(20) NOT NULL,
  "name" character varying(300) NOT NULL DEFAULT ''::character varying,
  "mime_type" character varying(50) NOT NULL DEFAULT ''::character varying,
  "size" integer,
  "storage" character varying(50) NOT NULL DEFAULT 'storage'::character varying,
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "path" character varying(200) NOT NULL DEFAULT ''::character varying,
  "md5" character varying(32) NOT NULL DEFAULT ''::character varying,
  CONSTRAINT "file_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "file" IS '附件表';
COMMENT ON COLUMN "file"."name" IS '文件名';
COMMENT ON COLUMN "file"."mime_type" IS 'mime类型';
COMMENT ON COLUMN "file"."size" IS '文件大小(b)';
COMMENT ON COLUMN "file"."storage" IS '存储引擎';
COMMENT ON COLUMN "file"."created_at" IS '创建时间';
COMMENT ON COLUMN "file"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "file"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "file"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "file"."path" IS '路径';
COMMENT ON COLUMN "file"."md5" IS '文件MD5值';
INSERT INTO "file" ("id", "name", "mime_type", "size", "storage", "created_at", "updated_at", "created_admin_id", "updated_admin_id", "path", "md5") VALUES ('693988309440921600', 'image.png', 'image/png', '39008', 'local', '2026-03-31 09:01:46.65+00', '2026-03-31 09:01:46.65+00', '604612615536115712', '604612615536115712', '3832e40249f4eb6c4feca1c257718907.png', '3832e40249f4eb6c4feca1c257718907'), ('694058309212176384', 'image.png', 'image/png', '91238', 'local', '2026-03-31 13:39:55.897+00', '2026-03-31 13:39:55.897+00', '604612615536115712', '604612615536115712', 'e27aae898e9bd0f8f1706246c1e6f372.png', 'e27aae898e9bd0f8f1706246c1e6f372'), ('694058854975012864', 'image.png', 'image/png', '91238', 'local', '2026-03-31 13:42:06.016+00', '2026-03-31 13:42:06.016+00', '604612615536115712', '604612615536115712', 'e27aae898e9bd0f8f1706246c1e6f372.png', 'e27aae898e9bd0f8f1706246c1e6f372'), ('694066691864264704', '82af4fb1-7049-491b-b346-78a73dd26d77.png', 'image/png', '66346', 'local', '2026-03-31 14:13:14.476+00', '2026-03-31 14:13:14.476+00', '604612615536115712', '604612615536115712', 'dac00cfc094a2b9acefeb67be311e1f5.png', 'dac00cfc094a2b9acefeb67be311e1f5'), ('694716253889101824', '973093c9-1fd1-4969-8448-6043090de4e9.png', 'image/png', '167404', 'local', '2026-04-02 01:14:22.131+00', '2026-04-02 01:14:22.131+00', '604612615536115712', '604612615536115712', 'b51e6a53459859d203041f8c0dffcd92.png', 'b51e6a53459859d203041f8c0dffcd92'), ('694720410150764544', '973093c9-1fd1-4969-8448-6043090de4e9.png', 'image/png', '167404', 'local', '2026-04-02 01:30:53.061+00', '2026-04-02 01:30:53.061+00', '604612615536115712', '604612615536115712', 'b51e6a53459859d203041f8c0dffcd92.png', 'b51e6a53459859d203041f8c0dffcd92'), ('694721036209356800', '973093c9-1fd1-4969-8448-6043090de4e9.png', 'image/png', '167404', 'local', '2026-04-02 01:33:22.326+00', '2026-04-02 01:33:22.326+00', '604612615536115712', '604612615536115712', 'b51e6a53459859d203041f8c0dffcd92.png', 'b51e6a53459859d203041f8c0dffcd92'), ('694721432378146816', '973093c9-1fd1-4969-8448-6043090de4e9.png', 'image/png', '167404', 'local', '2026-04-02 01:34:56.78+00', '2026-04-02 01:34:56.78+00', '604612615536115712', '604612615536115712', 'b51e6a53459859d203041f8c0dffcd92.png', 'b51e6a53459859d203041f8c0dffcd92'), ('755738869244100608', 'logo.png', 'image/png', '2483', 'local', '2026-09-17 10:36:27.377+00', '2026-09-17 10:36:27.377+00', '604612615536115712', '604612615536115712', 'cdfa039cf2cc04b2d9fbfabbb485bd72.png', 'cdfa039cf2cc04b2d9fbfabbb485bd72'), ('755975999350374400', 'A_minimalist_flat_illustration_2026-09-18T02-17-25.png', 'image/png', '442831', 'local', '2026-09-18 02:18:43.601+00', '2026-09-18 02:18:43.601+00', '604612615536115712', '604612615536115712', 'b0faa183985a2a91a49fbdf94091b4cd.png', 'b0faa183985a2a91a49fbdf94091b4cd'), ('760143898348617728', 'cms-ai-editorial.png', 'image/png', '2093495', 'local', '2026-09-29 14:20:28.157+00', '2026-09-29 14:20:28.157+00', '604612615536115712', '604612615536115712', '5f8e2710de2e976b7950f00e66862e43.png', '5f8e2710de2e976b7950f00e66862e43'), ('760143898965180416', 'cms-cloud-analytics.png', 'image/png', '2091818', 'local', '2026-09-29 14:20:28.304+00', '2026-09-29 14:20:28.304+00', '604612615536115712', '604612615536115712', 'e8e622afee1c3bfbcbfaf4e41a6b6264.png', 'e8e622afee1c3bfbcbfaf4e41a6b6264'), ('760143899787264000', 'cms-design-system.png', 'image/png', '1998269', 'local', '2026-09-29 14:20:28.5+00', '2026-09-29 14:20:28.5+00', '604612615536115712', '604612615536115712', '20599faa24eeb7c58efb36eb903e25e2.png', '20599faa24eeb7c58efb36eb903e25e2');

CREATE TABLE "job" (
  "id" character varying(20) NOT NULL,
  "name" character varying(50) NOT NULL DEFAULT ''::character varying,
  "strategy" smallint NOT NULL DEFAULT 1,
  "delay" bigint DEFAULT 0,
  "cron" character varying(200) DEFAULT ''::character varying,
  "deduplication" smallint NOT NULL DEFAULT 1,
  "job_id" character varying(100) NOT NULL,
  "progress" double precision,
  "type" smallint NOT NULL DEFAULT 1,
  "sql" text NOT NULL DEFAULT ''::text,
  "url" character varying(200) NOT NULL DEFAULT ''::character varying,
  "method" character varying(10) NOT NULL DEFAULT ''::character varying,
  "headers" text NOT NULL DEFAULT ''::text,
  "body" text NOT NULL DEFAULT ''::text,
  "query" text NOT NULL DEFAULT ''::text,
  "queue_name" character varying(200) NOT NULL DEFAULT ''::character varying,
  "queue_options" text NOT NULL DEFAULT ''::text,
  "status" character varying(20),
  "result" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "sucessed_num" bigint NOT NULL DEFAULT 0,
  "failed_num" bigint NOT NULL DEFAULT 0,
  "failed_response" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  CONSTRAINT "job_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "job" IS '任务表';
COMMENT ON COLUMN "job"."name" IS '任务名称';
COMMENT ON COLUMN "job"."strategy" IS '执行策略:1=立即执行;2=延时执行;3=定时执行;4=放弃执行';
COMMENT ON COLUMN "job"."delay" IS '延时时间(ms)';
COMMENT ON COLUMN "job"."cron" IS '定时表达式(cron)';
COMMENT ON COLUMN "job"."deduplication" IS '去重策略:1=可重复;2=去重;3=覆盖';
COMMENT ON COLUMN "job"."progress" IS '任务进度';
COMMENT ON COLUMN "job"."type" IS '任务类型:1=sql;2=url请求;3=自定义';
COMMENT ON COLUMN "job"."sql" IS 'sql语句';
COMMENT ON COLUMN "job"."url" IS 'url请求地址';
COMMENT ON COLUMN "job"."method" IS '请求方法';
COMMENT ON COLUMN "job"."headers" IS '请求头';
COMMENT ON COLUMN "job"."body" IS 'POST请求体(json格式)';
COMMENT ON COLUMN "job"."query" IS 'GET参数(json格式)';
COMMENT ON COLUMN "job"."queue_name" IS '自定义任务处理器';
COMMENT ON COLUMN "job"."queue_options" IS '自定义任务处理器参数(json格式)';
COMMENT ON COLUMN "job"."status" IS '任务状态:active=执行中;completed=已完成;failed=失败;waiting=等待中';
COMMENT ON COLUMN "job"."result" IS '任务执行结果';
COMMENT ON COLUMN "job"."sucessed_num" IS '任务执行成功数';
COMMENT ON COLUMN "job"."failed_num" IS '任务执行失败数';
COMMENT ON COLUMN "job"."failed_response" IS '任务执行失败响应';
COMMENT ON COLUMN "job"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "job"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "job"."created_at" IS '创建时间';
COMMENT ON COLUMN "job"."updated_at" IS '最后更新时间';
INSERT INTO "job" ("id", "name", "strategy", "delay", "cron", "deduplication", "job_id", "progress", "type", "sql", "url", "method", "headers", "body", "query", "queue_name", "queue_options", "status", "result", "sucessed_num", "failed_num", "failed_response", "created_admin_id", "updated_admin_id", "created_at", "updated_at") VALUES ('748740617445572608', '测试分开执行', '4', '0', '*/10 * * * * *', '1', 'repeat:scheduler-测试分开执行:1789129140000', '100', '1', 'select count(*) from user', '', '', '', '', '', '', '', 'completed', E'["{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1787975370000\\",\\"time\\":\\"2026-08-29 11:50:08.647\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1787975410000\\",\\"time\\":\\"2026-08-29 11:50:10.157\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1787975420000\\",\\"time\\":\\"2026-09-11 20:11:34.921\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128700000\\",\\"time\\":\\"2026-09-11 20:11:40.101\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128710000\\",\\"time\\":\\"2026-09-11 20:11:50.136\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128720000\\",\\"time\\":\\"2026-09-11 20:12:00.187\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128730000\\",\\"time\\":\\"2026-09-11 20:12:10.100\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128740000\\",\\"time\\":\\"2026-09-11 20:12:20.137\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128750000\\",\\"time\\":\\"2026-09-11 20:12:30.074\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128760000\\",\\"time\\":\\"2026-09-11 20:12:40.108\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128770000\\",\\"time\\":\\"2026-09-11 20:12:50.145\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128780000\\",\\"time\\":\\"2026-09-11 20:13:00.081\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128790000\\",\\"time\\":\\"2026-09-11 20:13:10.113\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128800000\\",\\"time\\":\\"2026-09-11 20:13:20.149\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128810000\\",\\"time\\":\\"2026-09-11 20:13:30.083\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128820000\\",\\"time\\":\\"2026-09-11 20:13:40.120\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128830000\\",\\"time\\":\\"2026-09-11 20:13:50.154\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128840000\\",\\"time\\":\\"2026-09-11 20:14:00.090\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128850000\\",\\"time\\":\\"2026-09-11 20:14:10.124\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128860000\\",\\"time\\":\\"2026-09-11 20:14:20.158\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128870000\\",\\"time\\":\\"2026-09-11 20:14:30.096\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128880000\\",\\"time\\":\\"2026-09-11 20:14:40.131\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128890000\\",\\"time\\":\\"2026-09-11 20:14:50.166\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128900000\\",\\"time\\":\\"2026-09-11 20:15:00.100\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128910000\\",\\"time\\":\\"2026-09-11 20:15:10.138\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128920000\\",\\"time\\":\\"2026-09-11 20:15:20.084\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128930000\\",\\"time\\":\\"2026-09-11 20:15:30.109\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128940000\\",\\"time\\":\\"2026-09-11 20:15:40.164\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128950000\\",\\"time\\":\\"2026-09-11 20:15:50.079\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128960000\\",\\"time\\":\\"2026-09-11 20:16:00.116\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128970000\\",\\"time\\":\\"2026-09-11 20:16:10.150\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128980000\\",\\"time\\":\\"2026-09-11 20:16:20.086\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789128990000\\",\\"time\\":\\"2026-09-11 20:16:30.121\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129000000\\",\\"time\\":\\"2026-09-11 20:16:40.155\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129010000\\",\\"time\\":\\"2026-09-11 20:16:50.092\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129020000\\",\\"time\\":\\"2026-09-11 20:17:00.126\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129030000\\",\\"time\\":\\"2026-09-11 20:17:10.164\\"}", "{\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129040000\\",\\"time\\":\\"2026-09-11 20:17:30.717\\"}", "{\\"result\\":[[{\\"count\\":\\"1\\"}],{\\"command\\":\\"SELECT\\",\\"rowCount\\":1,\\"oid\\":null,\\"rows\\":[{\\"count\\":\\"1\\"}],\\"fields\\":[{\\"name\\":\\"count\\",\\"tableID\\":0,\\"columnID\\":0,\\"dataTypeID\\":20,\\"dataTypeSize\\":8,\\"dataTypeModifier\\":-1,\\"format\\":\\"text\\"}],\\"_parsers\\":[null],\\"_types\\":{\\"_types\\":{},\\"text\\":{},\\"binary\\":{}},\\"RowCtor\\":null,\\"rowAsArray\\":false,\\"_prebuiltEmptyResultObject\\":{\\"count\\":null}}],\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129060000\\",\\"time\\":\\"2026-09-11 20:17:44.496\\"}", "{\\"result\\":[[{\\"count\\":\\"1\\"}],{\\"command\\":\\"SELECT\\",\\"rowCount\\":1,\\"oid\\":null,\\"rows\\":[{\\"count\\":\\"1\\"}],\\"fields\\":[{\\"name\\":\\"count\\",\\"tableID\\":0,\\"columnID\\":0,\\"dataTypeID\\":20,\\"dataTypeSize\\":8,\\"dataTypeModifier\\":-1,\\"format\\":\\"text\\"}],\\"_parsers\\":[null],\\"_types\\":{\\"_types\\":{},\\"text\\":{},\\"binary\\":{}},\\"RowCtor\\":null,\\"rowAsArray\\":false,\\"_prebuiltEmptyResultObject\\":{\\"count\\":null}}],\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129070000\\",\\"time\\":\\"2026-09-11 20:18:06.273\\"}", "{\\"result\\":[[{\\"count\\":\\"1\\"}],{\\"command\\":\\"SELECT\\",\\"rowCount\\":1,\\"oid\\":null,\\"rows\\":[{\\"count\\":\\"1\\"}],\\"fields\\":[{\\"name\\":\\"count\\",\\"tableID\\":0,\\"columnID\\":0,\\"dataTypeID\\":20,\\"dataTypeSize\\":8,\\"dataTypeModifier\\":-1,\\"format\\":\\"text\\"}],\\"_parsers\\":[null],\\"_types\\":{\\"_types\\":{},\\"text\\":{},\\"binary\\":{}},\\"RowCtor\\":null,\\"rowAsArray\\":false,\\"_prebuiltEmptyResultObject\\":{\\"count\\":null}}],\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129090000\\",\\"time\\":\\"2026-09-11 20:18:10.642\\"}", "{\\"result\\":[[{\\"count\\":\\"1\\"}],{\\"command\\":\\"SELECT\\",\\"rowCount\\":1,\\"oid\\":null,\\"rows\\":[{\\"count\\":\\"1\\"}],\\"fields\\":[{\\"name\\":\\"count\\",\\"tableID\\":0,\\"columnID\\":0,\\"dataTypeID\\":20,\\"dataTypeSize\\":8,\\"dataTypeModifier\\":-1,\\"format\\":\\"text\\"}],\\"_parsers\\":[null],\\"_types\\":{\\"_types\\":{},\\"text\\":{},\\"binary\\":{}},\\"RowCtor\\":null,\\"rowAsArray\\":false,\\"_prebuiltEmptyResultObject\\":{\\"count\\":null}}],\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129100000\\",\\"time\\":\\"2026-09-11 20:18:20.117\\"}", "{\\"result\\":[[{\\"count\\":\\"1\\"}],{\\"command\\":\\"SELECT\\",\\"rowCount\\":1,\\"oid\\":null,\\"rows\\":[{\\"count\\":\\"1\\"}],\\"fields\\":[{\\"name\\":\\"count\\",\\"tableID\\":0,\\"columnID\\":0,\\"dataTypeID\\":20,\\"dataTypeSize\\":8,\\"dataTypeModifier\\":-1,\\"format\\":\\"text\\"}],\\"_parsers\\":[null],\\"_types\\":{\\"_types\\":{},\\"text\\":{},\\"binary\\":{}},\\"RowCtor\\":null,\\"rowAsArray\\":false,\\"_prebuiltEmptyResultObject\\":{\\"count\\":null}}],\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129110000\\",\\"time\\":\\"2026-09-11 20:18:30.165\\"}", "{\\"result\\":[[{\\"count\\":\\"1\\"}],{\\"command\\":\\"SELECT\\",\\"rowCount\\":1,\\"oid\\":null,\\"rows\\":[{\\"count\\":\\"1\\"}],\\"fields\\":[{\\"name\\":\\"count\\",\\"tableID\\":0,\\"columnID\\":0,\\"dataTypeID\\":20,\\"dataTypeSize\\":8,\\"dataTypeModifier\\":-1,\\"format\\":\\"text\\"}],\\"_parsers\\":[null],\\"_types\\":{\\"_types\\":{},\\"text\\":{},\\"binary\\":{}},\\"RowCtor\\":null,\\"rowAsArray\\":false,\\"_prebuiltEmptyResultObject\\":{\\"count\\":null}}],\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129120000\\",\\"time\\":\\"2026-09-11 20:18:40.091\\"}", "{\\"result\\":[[{\\"count\\":\\"1\\"}],{\\"command\\":\\"SELECT\\",\\"rowCount\\":1,\\"oid\\":null,\\"rows\\":[{\\"count\\":\\"1\\"}],\\"fields\\":[{\\"name\\":\\"count\\",\\"tableID\\":0,\\"columnID\\":0,\\"dataTypeID\\":20,\\"dataTypeSize\\":8,\\"dataTypeModifier\\":-1,\\"format\\":\\"text\\"}],\\"_parsers\\":[null],\\"_types\\":{\\"_types\\":{},\\"text\\":{},\\"binary\\":{}},\\"RowCtor\\":null,\\"rowAsArray\\":false,\\"_prebuiltEmptyResultObject\\":{\\"count\\":null}}],\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129130000\\",\\"time\\":\\"2026-09-11 20:18:50.119\\"}", "{\\"result\\":[[{\\"count\\":\\"1\\"}],{\\"command\\":\\"SELECT\\",\\"rowCount\\":1,\\"oid\\":null,\\"rows\\":[{\\"count\\":\\"1\\"}],\\"fields\\":[{\\"name\\":\\"count\\",\\"tableID\\":0,\\"columnID\\":0,\\"dataTypeID\\":20,\\"dataTypeSize\\":8,\\"dataTypeModifier\\":-1,\\"format\\":\\"text\\"}],\\"_parsers\\":[null],\\"_types\\":{\\"_types\\":{},\\"text\\":{},\\"binary\\":{}},\\"RowCtor\\":null,\\"rowAsArray\\":false,\\"_prebuiltEmptyResultObject\\":{\\"count\\":null}}],\\"jobId\\":\\"repeat:scheduler-测试分开执行:1789129140000\\",\\"time\\":\\"2026-09-11 20:19:00.158\\"}"]', '46', '0', '[]', '604612615536115712', '604612615536115712', '2026-08-29 03:07:54.128+00', '2026-09-11 12:19:06.617+00');
CREATE UNIQUE INDEX job_name_unique ON job USING btree (name);

CREATE TABLE "organization_admin" (
  "system_admin_id" character varying(20) NOT NULL,
  "system_organization_id" character varying(20) NOT NULL,
  CONSTRAINT "organization_admin_pkey" PRIMARY KEY (system_admin_id, system_organization_id)
);
INSERT INTO "organization_admin" ("system_admin_id", "system_organization_id") VALUES ('604612615536115712', '740174696351268864'), ('604612615536115712', '740175409059987456'), ('632899190933946368', '740175409059987456'), ('632899190933946368', '740176007411007488');

CREATE TABLE "role_menu" (
  "system_menu_id" character varying(20) NOT NULL,
  "system_role_id" character varying(20) NOT NULL,
  CONSTRAINT "role_menu_pkey" PRIMARY KEY (system_menu_id, system_role_id)
);
INSERT INTO "role_menu" ("system_menu_id", "system_role_id") VALUES ('1', '635419305097297920'), ('2', '635419305097297920'), ('3', '635419305097297920'), ('639418081101217792', '635419305097297920'), ('658270533162369024', '635419154098159616'), ('658270533162369024', '635419305097297920'), ('664033965581008896', '635419305097297920'), ('664033965581008896', '635424437604188160'), ('664033966046576640', '635419305097297920'), ('664033966474395648', '635419305097297920'), ('664033966889631744', '635419305097297920'), ('664033967292284928', '635419305097297920'), ('664033967724298240', '635419305097297920'), ('664033968131145728', '635419305097297920'), ('664798918835437568', '635419305097297920'), ('664799640041816064', '635419305097297920'), ('664802471784218624', '635419305097297920'), ('664816340996980736', '635419305097297920'), ('701403170512830464', '635419154098159616'), ('701403170512830464', '635419305097297920'), ('719446778558021632', '635419305097297920'), ('719446779690483712', '635419154098159616'), ('719446779690483712', '635419305097297920'), ('742297136913186816', '635419305097297920'), ('742297138695766016', '635419305097297920'), ('753838055642628096', '635424437604188160'), ('754242324053098496', '635419305097297920');

CREATE TABLE "system_admin" (
  "id" character varying(20) NOT NULL,
  "username" character varying(50) NOT NULL DEFAULT ''::character varying,
  "nickname" character varying(20) NOT NULL DEFAULT ''::character varying,
  "password" character varying(64) NOT NULL DEFAULT ''::character varying,
  "salt" character varying(32) NOT NULL DEFAULT ''::character varying,
  "email" character varying(100),
  "mobile" character varying(11),
  "login_failure" smallint NOT NULL DEFAULT 0,
  "last_login_at" timestamp with time zone,
  "last_login_ip" character varying(50) NOT NULL DEFAULT ''::character varying,
  "status" smallint NOT NULL DEFAULT 1,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "deleted_at" timestamp(6) with time zone,
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  "avatar_file_id" character varying(20),
  CONSTRAINT "system_admin_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "system_admin" IS '管理员表';
COMMENT ON COLUMN "system_admin"."username" IS '用户名';
COMMENT ON COLUMN "system_admin"."nickname" IS '昵称';
COMMENT ON COLUMN "system_admin"."password" IS '密码';
COMMENT ON COLUMN "system_admin"."salt" IS '密码盐';
COMMENT ON COLUMN "system_admin"."email" IS '邮箱';
COMMENT ON COLUMN "system_admin"."mobile" IS '手机号';
COMMENT ON COLUMN "system_admin"."login_failure" IS '登录失败次数';
COMMENT ON COLUMN "system_admin"."last_login_at" IS '登录时间';
COMMENT ON COLUMN "system_admin"."last_login_ip" IS '登录ip';
COMMENT ON COLUMN "system_admin"."status" IS '状态:1=启用;0=禁用';
COMMENT ON COLUMN "system_admin"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "system_admin"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "system_admin"."deleted_at" IS '删除时间';
COMMENT ON COLUMN "system_admin"."created_at" IS '创建时间';
COMMENT ON COLUMN "system_admin"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "system_admin"."avatar_file_id" IS '头像附件id';
INSERT INTO "system_admin" ("id", "username", "nickname", "password", "salt", "email", "mobile", "login_failure", "last_login_at", "last_login_ip", "status", "created_admin_id", "updated_admin_id", "deleted_at", "created_at", "updated_at", "avatar_file_id") VALUES ('604612615536115712', 'admin', 'Admin', 'e8e51c59da6333bce7a443efc3e8e2e792ac6b5592a70523a16b074ba1dcc3c0', 'd06d09e00fbb3ed98f6ce1f004be912c', 'admin@outlock.com', '13333333333', '0', '2026-10-22 09:28:28.446+00', '::ffff:127.0.0.1', '1', '604612615536115712', '604612615536115712', NULL, '2025-07-27 09:54:40.704+00', '2026-10-22 09:28:28.446+00', NULL), ('632899190933946368', 'Test', 'test', 'f7e1c73f94a6443bea4b7b02c50958ab2ba0bfce22b33d29df0f8e978678f2dc', 'b1aa1d58153e0eb912caa2be930ccb59', NULL, '15555555555', '0', '2026-09-13 07:33:59.68+00', '::ffff:127.0.0.1', '1', '604612615536115712', '604612615536115712', NULL, '2025-10-13 11:15:25.818+00', '2026-09-17 10:36:48.146+00', NULL), ('756904549360336896', 'tmp-cms-perm-1789919301405', 'CMS权限临时测试', '8ec1528657c4ad83fce33f80aab0b8061909cff86abd3b4de9d0b3693cd18c34', '8aae29bebedb6a9e0ae6757216c08b62', NULL, '19919307077', '0', NULL, '', '0', '604612615536115712', '604612615536115712', '2026-09-20 15:48:46.797+00', '2026-09-20 15:48:27.174+00', '2026-09-20 15:48:46.797+00', NULL), ('756905302367928320', 'cp9f1575', 'CMS权限临时测试', '430f68b91bfe73ba9414d97652dbe05b8082bcdb1492e6404b6f46cdb4b31ab5', 'be61d5d530522998c32e64696118462a', NULL, '19919486608', '0', '2026-09-20 15:51:59.811+00', '::ffff:127.0.0.1', '0', '604612615536115712', '604612615536115712', '2026-09-20 15:52:26.677+00', '2026-09-20 15:51:26.705+00', '2026-09-20 15:52:26.677+00', NULL);
CREATE UNIQUE INDEX system_admin_email_unique ON system_admin USING btree (email) WHERE (deleted_at IS NOT NULL);
CREATE UNIQUE INDEX system_admin_mobile_unique ON system_admin USING btree (mobile) WHERE (deleted_at IS NOT NULL);
CREATE UNIQUE INDEX system_admin_username_unique ON system_admin USING btree (username) WHERE (deleted_at IS NOT NULL);

CREATE TABLE "system_config" (
  "id" character varying(20) NOT NULL,
  "variable_type" character varying(20) NOT NULL DEFAULT 'string'::character varying,
  "variable_title" character varying(100) NOT NULL DEFAULT ''::character varying,
  "is_builtin" boolean NOT NULL DEFAULT false,
  "group_id" character varying(20) NOT NULL,
  "value" text,
  "options" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 100,
  "is_required" boolean NOT NULL DEFAULT false,
  "status" integer NOT NULL DEFAULT 1,
  "description" text NOT NULL DEFAULT ''::text,
  "variable_code" character varying(100) NOT NULL DEFAULT ''::character varying,
  CONSTRAINT "system_config_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "system_config" IS '系统配置项表';
COMMENT ON COLUMN "system_config"."variable_type" IS '变量类型';
COMMENT ON COLUMN "system_config"."variable_title" IS '变量标题';
COMMENT ON COLUMN "system_config"."is_builtin" IS '是否内置';
COMMENT ON COLUMN "system_config"."group_id" IS '分组ID';
COMMENT ON COLUMN "system_config"."value" IS '配置值';
COMMENT ON COLUMN "system_config"."options" IS '字典选项';
COMMENT ON COLUMN "system_config"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "system_config"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "system_config"."created_at" IS '创建时间';
COMMENT ON COLUMN "system_config"."updated_at" IS '最后更新时间';
INSERT INTO "system_config" ("id", "variable_type", "variable_title", "is_builtin", "group_id", "value", "options", "created_admin_id", "updated_admin_id", "created_at", "updated_at", "sort_order", "is_required", "status", "description", "variable_code") VALUES ('00ad413cd55327bae636', 'string', '版本号', 'true', 'b15270a767c4b63c7088', '1.3.6', '[]', NULL, '604612615536115712', '2026-09-13 14:36:07.261478+00', '2026-09-14 12:01:17.640934+00', '3', 'false', '1', '当前系统版本号', 'version_number'), ('08b89d3caec7cf7e0564', 'string', '站点名称', 'true', 'b15270a767c4b63c7088', 'Me - Admin', '[]', NULL, '604612615536115712', '2026-09-13 14:36:07.261478+00', '2026-09-14 12:01:17.640934+00', '1', 'true', '1', '网站名称，显示在浏览器标题栏', 'site_name'), ('0e474535b9337c44b5ee', 'number', '菜单类型', 'true', '3010fae57e1e341cb08f', '2', '[{"sort": 1, "label": "目录", "value": 1, "status": 1}, {"sort": 2, "label": "菜单", "value": 2, "status": 1}, {"sort": 3, "label": "按钮", "value": 3, "status": 1}]', NULL, NULL, '2026-09-13 14:48:59.372478+00', '2026-09-14 12:01:17.640934+00', '5', 'false', '1', '菜单类型选项', 'menu_type'), ('1789634019124443384', 'textarea', '页脚链接列', 'false', '755707956825161728', '[{"title":"支持","links":[{"text":"反馈","url":"https://github.com/meadmin-cn/meadmin/issues","target":"_self","enabled":true},{"text":"加入社区","url":"https://github.com/meadmin-cn/meadmin/issues","target":"_self","enabled":true},{"text":"QQ 交流群","url":"https://jq.qq.com/?_wv=1027&k=zSjWSant","target":"_self","enabled":true},{"text":"商务合作","url":"https://github.com/meadmin-cn/meadmin/issues","target":"_self","enabled":true}],"enabled":true},{"title":"相关链接","links":[{"text":"文档","url":"https://www.meadmin.cn/aon/doc/","target":"_self","enabled":true},{"text":"演示","url":"https://demo.meadmin.cn/aon/doc/","target":"_self","enabled":true},{"text":"后台演示","url":"https://demo.meadmin.cn/aon/doc/demo","target":"_self","enabled":true}],"enabled":true}]', '[]', '604612615536115712', '604612615536115712', '2026-09-17 08:33:39.124+00', '2026-09-18 11:32:58.751+00', '40', 'false', '1', 'JSON数组：每项含title、enabled、links；links每项含text、url、target、enabled。数组顺序即显示顺序；enabled=false隐藏；target为_self或_blank；[]隐藏全部栏目。支持站内路径、http/https、mailto/tel。', 'columns'), ('18a46e4d5de5b7dcb73c', 'number', '组织状态', 'true', '3010fae57e1e341cb08f', '1', '[]', NULL, '604612615536115712', '2026-09-13 14:48:59.372478+00', '2026-09-14 12:13:59.137+00', '3', 'false', '1', '组织状态选项', 'org_status'), ('49cc72fe940b0dc9b2ea', 'string', '联系电话', 'false', 'fb17ef9c47d7ae19a7de', '', '[]', NULL, '604612615536115712', '2026-09-14 12:01:17.640934+00', '2026-09-14 12:01:17.640934+00', '2', 'false', '1', '客服联系电话', 'contact_phone'), ('4ce57e09046d37e6bc76', 'string', '备案号', 'true', 'b15270a767c4b63c7088', 'x公网安备 xxxxxxxxxxxxxx号', '[]', NULL, '604612615536115712', '2026-09-13 14:36:07.261478+00', '2026-09-18 11:37:25.779+00', '2', 'false', '1', 'ICP 备案号，显示在页脚', 'icp_number'), ('5b321c245a8fb77752d6', 'keyvalue', 'API 端点映射', 'false', 'fb17ef9c47d7ae19a7de', '{"order":"/api/order","user":"/api/user"}', '[]', NULL, '604612615536115712', '2026-09-14 11:28:53.189009+00', '2026-09-14 13:38:31.287+00', '5', 'false', '1', '键值对类型示例', 'api_endpoint_mapping'), ('60022e7b07e610fddf4b', 'string', '联系邮箱', 'false', 'fb17ef9c47d7ae19a7de', '', '[]', NULL, '604612615536115712', '2026-09-14 12:01:17.640934+00', '2026-09-14 12:01:17.640934+00', '1', 'false', '1', '客服联系邮箱', 'contact_email'), ('6dc6dcd471de906e0981', 'number', '菜单状态', 'true', '3010fae57e1e341cb08f', '1', '[{"sort": 1, "label": "启用", "value": 1, "status": 1}, {"sort": 2, "label": "禁用", "value": 0, "status": 1}]', NULL, NULL, '2026-09-13 14:48:59.372478+00', '2026-09-14 12:01:17.640934+00', '4', 'false', '1', '菜单状态选项', 'menu_status'), ('754695313331060736', 'number', '建站年份', 'false', 'fb17ef9c47d7ae19a7de', '2026', '[]', '604612615536115712', '604612615536115712', '2026-09-14 13:29:44.26+00', '2026-09-14 13:38:35.991+00', '100', 'false', '1', '数字类型示例', 'site_founding_year'), ('754743795144196096', 'dict', '分页测试字典1', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:23.225+00', '2026-09-14 16:42:23.225+00', '901', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_1'), ('754743796306018304', 'dict', '分页测试字典2', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:23.501+00', '2026-09-14 16:42:23.501+00', '902', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_2'), ('754743797493006336', 'dict', '分页测试字典3', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:23.784+00', '2026-09-14 16:42:23.784+00', '903', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_3'), ('754743798604496896', 'dict', '分页测试字典4', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:24.049+00', '2026-09-14 16:42:24.049+00', '904', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_4'), ('754743799728570368', 'dict', '分页测试字典5', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:24.317+00', '2026-09-14 16:42:24.317+00', '905', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_5'), ('754743800861032448', 'dict', '分页测试字典6', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:24.587+00', '2026-09-14 16:42:24.587+00', '906', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_6'), ('754743802056409088', 'dict', '分页测试字典7', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:24.872+00', '2026-09-14 16:42:24.872+00', '907', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_7'), ('754743803184676864', 'dict', '分页测试字典8', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:25.141+00', '2026-09-14 16:42:25.141+00', '908', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_8'), ('754743804266807296', 'dict', '分页测试字典9', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:25.399+00', '2026-09-14 16:42:25.399+00', '909', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_9'), ('754743805374103552', 'dict', '分页测试字典10', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:25.663+00', '2026-09-14 16:42:25.663+00', '910', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_10'), ('754743806481399808', 'dict', '分页测试字典11', 'false', '3010fae57e1e341cb08f', '{}', '[{"sort": 1, "label": "是", "value": "yes", "status": 1}]', '604612615536115712', '604612615536115712', '2026-09-14 16:42:25.927+00', '2026-09-14 16:42:25.927+00', '911', 'false', '1', '浏览器验收测试数据，可删除', 'pagination_test_dict_11'), ('755083054686404608', 'dict', '分页测试字典12', 'false', '3010fae57e1e341cb08f', '{}', '[]', '604612615536115712', '604612615536115712', '2026-09-15 15:10:29.002+00', '2026-09-15 15:10:29.002+00', '100', 'true', '1', '', 'pagination_test_dict_12'), ('755707959958306816', 'string', '品牌名称', 'false', '755707956825161728', 'Me - Admin', '[]', '604612615536115712', '604612615536115712', '2026-09-17 08:33:38.029+00', '2026-09-17 08:33:38.029+00', '10', 'false', '1', '页脚品牌名称，默认沿用网站实际名称。', 'brand_name'), ('755707961283706880', 'string', '品牌链接', 'false', '755707956825161728', '/', '[]', '604612615536115712', '604612615536115712', '2026-09-17 08:33:38.345+00', '2026-09-17 08:33:38.345+00', '20', 'false', '1', '品牌点击地址，仅使用站内路径或 http/https 地址。', 'brand_url'), ('755707962567163904', 'string', '版权信息', 'false', '755707956825161728', '© 2025 - {year}. All Rights Reserved. Power by MeAdmin', '[]', '604612615536115712', '604612615536115712', '2026-09-17 08:33:38.651+00', '2026-09-17 10:17:58.69+00', '30', 'false', '1', '版权文本，{year} 自动替换为当前年份。', 'copyright'), ('755707965943578624', 'number', '手机显示链接', 'false', '755707956825161728', '0', '[]', '604612615536115712', '604612615536115712', '2026-09-17 08:33:39.456+00', '2026-09-17 08:33:39.456+00', '50', 'false', '1', '手机端是否显示链接列：0 隐藏，1 显示。', 'mobile_links'), ('756114051557228544', 'string', '描述', 'false', '755707956825161728', '基于 Midway + Vue 3 + TypeScript 的全栈一站式解决方案，让后台开发更简单、更优雅。', '[]', '604612615536115712', '604612615536115712', '2026-09-18 11:27:17.811+00', '2026-09-18 11:27:34.224+00', '100', 'false', '1', '', 'description'), ('a95f89131904ddb24583', 'number', '角色状态', 'true', '3010fae57e1e341cb08f', '1', '[{"sort": 1, "label": "启用", "value": 1, "status": 1}, {"sort": 2, "label": "禁用", "value": 0, "status": 1}]', NULL, NULL, '2026-09-13 14:48:59.372478+00', '2026-09-14 12:01:17.640934+00', '2', 'false', '1', '角色状态选项', 'role_status'), ('bde5f4d278db872edcae', 'text', '站点说明', 'true', 'b15270a767c4b63c7088', 'Me-Admin 基于 Midway + Vue 3 + TypeScript 构建，一键 CRUD、SSR 渲染、权限体系开箱即用，助你以最小成本交付企业级应用。', '[]', NULL, '604612615536115712', '2026-09-13 14:36:07.261478+00', '2026-09-17 10:41:13.816+00', '4', 'false', '1', '站点简介，用于 SEO', 'site_description'), ('d14b8c705500cb1455f9', 'array', '启用功能', 'false', 'fb17ef9c47d7ae19a7de', '["用户管理","日志审计","数据权限"]', '[]', NULL, '604612615536115712', '2026-09-14 11:28:53.189009+00', '2026-09-14 12:01:17.640934+00', '4', 'false', '1', '数组类型示例', 'enabled_features'), ('d427a687e0c2f12e2640', 'dict', '语言选项', 'false', 'fb17ef9c47d7ae19a7de', '{"backend":"zh-cn","frontend":"en-us"}', '[{"sort": 1, "label": "后台", "value": "backend", "status": 1}, {"sort": 2, "label": "前台", "value": "frontend", "status": 1}]', NULL, '604612615536115712', '2026-09-14 11:28:53.189009+00', '2026-09-14 12:01:17.640934+00', '6', 'false', '1', '自定义字典类型示例', 'language_options'), ('df90297e452691428b67', 'text', '页脚说明', 'false', 'fb17ef9c47d7ae19a7de', '', '[]', NULL, '604612615536115712', '2026-09-14 12:01:17.640934+00', '2026-09-14 12:01:17.640934+00', '3', 'false', '1', '页脚额外说明文字', 'footer_description'), ('fcc59df6502cdfe58635', 'number', '数据权限范围', 'true', '3010fae57e1e341cb08f', '1', '[{"sort": 1, "label": "全部数据", "value": 1, "status": 1}, {"sort": 2, "label": "组织数据", "value": 2, "status": 1}, {"sort": 3, "label": "组织及以下数据", "value": 3, "status": 1}, {"sort": 4, "label": "仅本人数据", "value": 4, "status": 1}]', NULL, NULL, '2026-09-13 14:48:59.372478+00', '2026-09-14 12:01:17.640934+00', '6', 'false', '1', '数据权限范围选项', 'data_permission_scope');
CREATE INDEX system_config_group_id_idx ON system_config USING btree (group_id);
CREATE UNIQUE INDEX system_config_group_variable_code_unique ON system_config USING btree (variable_code, group_id);

CREATE TABLE "system_config_group" (
  "id" character varying(20) NOT NULL,
  "group_code" character varying(50) NOT NULL DEFAULT ''::character varying,
  "group_name" character varying(100) NOT NULL DEFAULT ''::character varying,
  "group_type" character varying(20) NOT NULL DEFAULT 'custom'::character varying,
  "is_builtin" boolean NOT NULL DEFAULT false,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  "sort_order" integer NOT NULL DEFAULT 100,
  "description" text NOT NULL DEFAULT ''::text,
  "status" integer NOT NULL DEFAULT 1,
  CONSTRAINT "system_config_group_pkey" PRIMARY KEY (id),
  CONSTRAINT "system_config_group_group_code_unique" UNIQUE (group_code)
);
COMMENT ON TABLE "system_config_group" IS '系统配置分组表';
COMMENT ON COLUMN "system_config_group"."group_code" IS '分组编码';
COMMENT ON COLUMN "system_config_group"."group_name" IS '分组名称';
COMMENT ON COLUMN "system_config_group"."group_type" IS '分组类型:base=基础;dict=字典;custom=自定义';
COMMENT ON COLUMN "system_config_group"."is_builtin" IS '是否内置';
COMMENT ON COLUMN "system_config_group"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "system_config_group"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "system_config_group"."created_at" IS '创建时间';
COMMENT ON COLUMN "system_config_group"."updated_at" IS '最后更新时间';
INSERT INTO "system_config_group" ("id", "group_code", "group_name", "group_type", "is_builtin", "created_admin_id", "updated_admin_id", "created_at", "updated_at", "sort_order", "description", "status") VALUES ('3010fae57e1e341cb08f', 'dict', '字典配置', 'dict', 'true', NULL, NULL, '2026-09-13 14:36:07.261478+00', '2026-09-14 12:01:17.640934+00', '2', '系统业务字典配置', '1'), ('755707956825161728', 'site_footer', '站点页脚配置', 'custom', 'false', '604612615536115712', '604612615536115712', '2026-09-17 08:33:37.282+00', '2026-09-18 11:26:11.648+00', '100', '前台页脚品牌、版权与链接列配置。', '1'), ('b15270a767c4b63c7088', 'base', '基础配置', 'base', 'true', NULL, NULL, '2026-09-13 14:36:07.261478+00', '2026-09-14 12:01:17.640934+00', '1', '系统基础运行配置', '1'), ('fb17ef9c47d7ae19a7de', 'site_extend', '站点扩展配置', 'custom', 'false', NULL, '604612615536115712', '2026-09-14 11:28:53.189009+00', '2026-09-18 11:26:11.674+00', '101', '站点扩展配置示例', '1');
CREATE UNIQUE INDEX system_config_group_code_unique ON system_config_group USING btree (group_code);

CREATE TABLE "system_menu" (
  "id" character varying(20) NOT NULL,
  "title" character varying(100) NOT NULL DEFAULT ''::character varying,
  "menu_type" smallint NOT NULL,
  "status" smallint NOT NULL DEFAULT 1,
  "rule" character varying(100) NOT NULL DEFAULT ''::character varying,
  "order_num" smallint NOT NULL DEFAULT 0,
  "path" character varying(500) NOT NULL DEFAULT ''::character varying,
  "is_link" smallint NOT NULL DEFAULT 0,
  "component" character varying(500) NOT NULL DEFAULT ''::character varying,
  "hide_menu" smallint NOT NULL DEFAULT 0,
  "cache" smallint NOT NULL DEFAULT 0,
  "icon" character varying(50) NOT NULL DEFAULT ''::character varying,
  "affix" smallint NOT NULL DEFAULT 0,
  "always_show" smallint NOT NULL DEFAULT 0,
  "breadcrumb" smallint NOT NULL DEFAULT 1,
  "parent_id" character varying(100),
  "left" bigint,
  "right" bigint,
  "lock_version" character varying(100) NOT NULL DEFAULT ''::character varying,
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  CONSTRAINT "system_menu_copy_pkey1" PRIMARY KEY (id)
);
COMMENT ON TABLE "system_menu" IS '菜单表';
COMMENT ON COLUMN "system_menu"."title" IS '菜单名称';
COMMENT ON COLUMN "system_menu"."menu_type" IS '类型:1=目录;2=菜单;3=按钮';
COMMENT ON COLUMN "system_menu"."status" IS '状态:1=启用;0=禁用';
COMMENT ON COLUMN "system_menu"."rule" IS '权限';
COMMENT ON COLUMN "system_menu"."order_num" IS '排序(降序)';
COMMENT ON COLUMN "system_menu"."path" IS '路径';
COMMENT ON COLUMN "system_menu"."is_link" IS '外链:1=是;0=否';
COMMENT ON COLUMN "system_menu"."component" IS '组件路径(相对于views文件夹)';
COMMENT ON COLUMN "system_menu"."hide_menu" IS '隐藏:1=是;0=否';
COMMENT ON COLUMN "system_menu"."cache" IS '缓存:1=是;0=否';
COMMENT ON COLUMN "system_menu"."icon" IS '图标';
COMMENT ON COLUMN "system_menu"."affix" IS '固定tag:1=是;0=否';
COMMENT ON COLUMN "system_menu"."always_show" IS '恒定展示(只有一个子元素时不隐藏):1=是;0=否';
COMMENT ON COLUMN "system_menu"."breadcrumb" IS '面包屑:1=展示;0=不展示';
COMMENT ON COLUMN "system_menu"."parent_id" IS '父级id';
COMMENT ON COLUMN "system_menu"."left" IS '左树边界';
COMMENT ON COLUMN "system_menu"."right" IS '右树边界';
COMMENT ON COLUMN "system_menu"."lock_version" IS '锁版本号';
COMMENT ON COLUMN "system_menu"."created_at" IS '创建时间';
COMMENT ON COLUMN "system_menu"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "system_menu"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "system_menu"."updated_admin_id" IS '最后更新者(管理员)Id';
INSERT INTO "system_menu" ("id", "title", "menu_type", "status", "rule", "order_num", "path", "is_link", "component", "hide_menu", "cache", "icon", "affix", "always_show", "breadcrumb", "parent_id", "left", "right", "lock_version", "created_at", "updated_at", "created_admin_id", "updated_admin_id") VALUES ('1', '系统设置', '1', '1', 'system', '998', '/system', '0', '', '0', '0', 'MelIconSetting', '0', '0', '1', NULL, '3', '114', '', '2025-07-31 07:20:29+00', '2026-09-18 02:29:54.416+00', NULL, '604612615536115712'), ('2', '管理员', '2', '1', 'system_admin', '99', '/system/admin', '0', 'system/admin/index', '0', '0', 'MelIconUser', '0', '0', '1', '1', '4', '15', '', '2025-07-31 07:20:29+00', '2026-09-18 02:29:54.415+00', NULL, '604612615536115712'), ('3', '菜单权限', '2', '1', 'system_menu_role', '97', '/system/menu', '0', 'system/menuRole/index', '0', '0', 'MelIconMenu', '0', '0', '1', '1', '32', '61', '', '2025-07-31 07:20:29+00', '2026-09-18 02:29:54.416+00', NULL, '604612615536115712'), ('639418081101217792', '管理员附件', '2', '1', 'file', '999', 'file', '0', 'file/index', '0', '1', 'MelIconFolder', '0', '0', '1', '664816340996980736', '116', '127', '', '2025-10-31 10:59:10.348+00', '2026-09-18 02:29:54.418+00', '604612615536115712', '604612615536115712'), ('658270533162369024', '列表', '3', '1', 'system_admin_list', '99', '', '0', '', '0', '1', '', '0', '0', '1', '2', '5', '6', '', '2025-12-22 11:32:05.181+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('658270653836689408', '新增', '3', '1', 'system_admin_add', '97', '', '0', '', '0', '1', '', '0', '0', '1', '2', '9', '10', '', '2025-12-22 11:32:33.952+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('658270767712043008', '编辑', '3', '1', 'system_admin_edit', '96', '', '0', '', '0', '1', '', '0', '0', '1', '2', '11', '12', '', '2025-12-22 11:33:01.102+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('658270899723567104', '删除', '3', '1', 'system_admin_del', '95', '', '0', '', '0', '1', '', '0', '0', '1', '2', '13', '14', '', '2025-12-22 11:33:32.576+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('664033965581008896', '示例', '1', '1', 'example', '995', '/example', '0', '', '0', '0', 'MelIconPlatform', '0', '1', '1', NULL, '153', '178', '', '2026-01-07 09:13:54.549+00', '2026-09-18 02:29:54.413+00', NULL, '604612615536115712'), ('664033966046576640', 'Demo', '2', '1', 'example_demo', '999', '/example/demo', '0', 'example/demo/index', '0', '0', '', '0', '0', '1', '664033965581008896', '166', '177', '', '2026-01-07 09:13:54.66+00', '2026-09-18 02:29:54.413+00', NULL, '604612615536115712'), ('664033966474395648', '列表', '3', '1', 'example_demo_list', '99', '', '0', '', '0', '0', '', '0', '0', '1', '664033966046576640', '167', '168', '', '2026-01-07 09:13:54.762+00', '2026-09-18 02:29:54.412+00', NULL, '604612615536115712'), ('664033966889631744', '详情', '3', '1', 'example_demo_info', '98', '', '0', '', '0', '0', '', '0', '0', '1', '664033966046576640', '169', '170', '', '2026-01-07 09:13:54.862+00', '2026-09-18 02:29:54.413+00', NULL, '604612615536115712'), ('664033967292284928', '新增', '3', '1', 'example_demo_add', '97', '', '0', '', '0', '0', '', '0', '0', '1', '664033966046576640', '171', '172', '', '2026-01-07 09:13:54.958+00', '2026-09-18 02:29:54.412+00', NULL, '604612615536115712'), ('664033967724298240', '编辑', '3', '1', 'example_demo_edit', '96', '', '0', '', '0', '0', '', '0', '0', '1', '664033966046576640', '173', '174', '', '2026-01-07 09:13:55.06+00', '2026-09-18 02:29:54.411+00', NULL, '604612615536115712'), ('664033968131145728', '删除', '3', '1', 'example_demo_del', '95', '', '0', '', '0', '0', '', '0', '0', '1', '664033966046576640', '175', '176', '', '2026-01-07 09:13:55.158+00', '2026-09-18 02:29:54.412+00', NULL, '604612615536115712'), ('664797278774493184', '列表', '3', '1', 'system_menu_list', '99', '', '0', '', '0', '1', '', '0', '0', '1', '664799196632580096', '48', '49', '', '2026-01-09 11:47:02.598+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('664797436325134336', '新增', '3', '1', 'system_menu_add', '97', '', '0', '', '0', '1', '', '0', '0', '1', '664799196632580096', '52', '53', '', '2026-01-09 11:47:40.16+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('664797552121479168', '编辑', '3', '1', 'system_menu_edit', '96', '', '0', '', '0', '1', '', '0', '0', '1', '664799196632580096', '54', '55', '', '2026-01-09 11:48:07.767+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('664797660825255936', '删除', '3', '1', 'system_menu_del', '95', '', '0', '', '0', '1', '', '0', '0', '1', '664799196632580096', '56', '57', '', '2026-01-09 11:48:33.684+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('664797875221299200', '详情', '3', '1', 'system_menu_info', '98', '', '0', '', '0', '1', '', '0', '0', '1', '664799196632580096', '50', '51', '', '2026-01-09 11:49:24.8+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('664798399022759936', '详情', '3', '1', 'system_admin_info', '98', '', '0', '', '0', '1', '', '0', '0', '1', '2', '7', '8', '', '2026-01-09 11:51:29.684+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('664798918835437568', '角色组', '3', '1', 'system_role', '99', '', '0', '', '0', '1', '', '0', '0', '1', '3', '33', '46', '', '2026-01-09 11:53:33.617+00', '2026-09-18 02:29:54.416+00', '604612615536115712', '604612615536115712'), ('664799196632580096', '菜单', '3', '1', 'system_menu', '98', '', '0', '', '0', '1', '', '0', '0', '1', '3', '47', '58', '', '2026-01-09 11:54:39.849+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('664799640041816064', '列表', '3', '1', 'system_role_list', '99', '', '0', '', '0', '1', '', '0', '0', '1', '664798918835437568', '34', '35', '', '2026-01-09 11:56:25.566+00', '2026-09-18 02:29:54.416+00', '604612615536115712', '604612615536115712'), ('664799732303921152', '详情', '3', '1', 'system_role_info', '98', '', '0', '', '0', '1', '', '0', '0', '1', '664798918835437568', '36', '37', '', '2026-01-09 11:56:47.563+00', '2026-09-18 02:29:54.416+00', '604612615536115712', '604612615536115712'), ('664799846128943104', '新增', '3', '1', 'system_role_add', '97', '', '0', '', '0', '1', '', '0', '0', '1', '664798918835437568', '38', '39', '', '2026-01-09 11:57:14.701+00', '2026-09-18 02:29:54.416+00', '604612615536115712', '604612615536115712'), ('664799999699189760', '编辑', '3', '1', 'system_role_edit', '96', '', '0', '', '0', '1', '', '0', '0', '1', '664798918835437568', '40', '41', '', '2026-01-09 11:57:51.316+00', '2026-09-18 02:29:54.416+00', '604612615536115712', '604612615536115712'), ('664800095295766528', '删除', '3', '1', 'system_role_del', '95', '', '0', '', '0', '1', '', '0', '0', '1', '664798918835437568', '42', '43', '', '2026-01-09 11:58:14.107+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('664802471784218624', '列表', '3', '1', 'file_list', '99', '', '0', '', '0', '1', '', '0', '0', '1', '639418081101217792', '117', '118', '', '2026-01-09 12:07:40.707+00', '2026-09-18 02:29:54.418+00', '604612615536115712', '604612615536115712'), ('664802570002235392', '详情', '3', '1', 'file_info', '98', '', '0', '', '0', '1', '', '0', '0', '1', '639418081101217792', '119', '120', '', '2026-01-09 12:08:04.123+00', '2026-09-18 02:29:54.418+00', '604612615536115712', '604612615536115712'), ('664802952766029824', '编辑', '3', '1', 'file_edit', '96', '', '0', '', '0', '1', '', '0', '0', '1', '639418081101217792', '123', '124', '', '2026-01-09 12:09:35.381+00', '2026-09-18 02:29:54.418+00', '604612615536115712', '604612615536115712'), ('664803080839102464', '新增', '3', '1', 'file_add', '97', '', '0', '', '0', '1', '', '0', '0', '1', '639418081101217792', '121', '122', '', '2026-01-09 12:10:05.916+00', '2026-09-18 02:29:54.418+00', '604612615536115712', '604612615536115712'), ('664803191971381248', '删除', '3', '1', 'file_del', '95', '', '0', '', '0', '1', '', '0', '0', '1', '639418081101217792', '125', '126', '', '2026-01-09 12:10:32.412+00', '2026-09-18 02:29:54.418+00', '604612615536115712', '604612615536115712'), ('664813414475890688', '用户管理', '2', '1', 'user', '996', '/user', '0', 'user/index', '0', '0', 'MelIconUser', '0', '0', '1', NULL, '141', '152', '', '2026-01-09 12:51:09.647+00', '2026-09-18 02:29:54.418+00', NULL, '604612615536115712'), ('664813415100841984', '列表', '3', '1', 'user_list', '99', '', '0', '', '0', '0', '', '0', '0', '1', '664813414475890688', '142', '143', '', '2026-01-09 12:51:09.796+00', '2026-09-18 02:29:54.416+00', NULL, '604612615536115712'), ('664813415503495168', '详情', '3', '1', 'user_info', '98', '', '0', '', '0', '0', '', '0', '0', '1', '664813414475890688', '144', '145', '', '2026-01-09 12:51:09.892+00', '2026-09-18 02:29:54.417+00', NULL, '604612615536115712'), ('664813415910342656', '新增', '3', '1', 'user_add', '97', '', '0', '', '0', '0', '', '0', '0', '1', '664813414475890688', '146', '147', '', '2026-01-09 12:51:09.989+00', '2026-09-18 02:29:54.416+00', NULL, '604612615536115712'), ('664813416312995840', '编辑', '3', '1', 'user_edit', '96', '', '0', '', '0', '0', '', '0', '0', '1', '664813414475890688', '148', '149', '', '2026-01-09 12:51:10.085+00', '2026-09-18 02:29:54.416+00', NULL, '604612615536115712'), ('664813416715649024', '删除', '3', '1', 'user_del', '95', '', '0', '', '0', '0', '', '0', '0', '1', '664813414475890688', '150', '151', '', '2026-01-09 12:51:10.181+00', '2026-09-18 02:29:54.418+00', NULL, '604612615536115712'), ('664816034456272896', '前台附件', '2', '1', 'user_file', '998', 'user/file', '0', 'user/file/index', '0', '0', 'MelIconFolder', '0', '0', '1', '664816340996980736', '128', '139', '', '2026-01-09 13:01:34.3+00', '2026-09-18 02:29:54.419+00', NULL, '604612615536115712'), ('664816034934423552', '列表', '3', '1', 'user_file_list', '99', '', '0', '', '0', '0', '', '0', '0', '1', '664816034456272896', '129', '130', '', '2026-01-09 13:01:34.413+00', '2026-09-18 02:29:54.419+00', NULL, '604612615536115712'), ('664816035383214080', '详情', '3', '1', 'user_file_info', '98', '', '0', '', '0', '0', '', '0', '0', '1', '664816034456272896', '131', '132', '', '2026-01-09 13:01:34.52+00', '2026-09-18 02:29:54.419+00', NULL, '604612615536115712'), ('664816035819421696', '新增', '3', '1', 'user_file_add', '97', '', '0', '', '0', '0', '', '0', '0', '1', '664816034456272896', '133', '134', '', '2026-01-09 13:01:34.624+00', '2026-09-18 02:29:54.419+00', NULL, '604612615536115712'), ('664816036259823616', '编辑', '3', '1', 'user_file_edit', '96', '', '0', '', '0', '0', '', '0', '0', '1', '664816034456272896', '135', '136', '', '2026-01-09 13:01:34.729+00', '2026-09-18 02:29:54.419+00', NULL, '604612615536115712'), ('664816036704419840', '删除', '3', '1', 'user_file_del', '95', '', '0', '', '0', '0', '', '0', '0', '1', '664816034456272896', '137', '138', '', '2026-01-09 13:01:34.835+00', '2026-09-18 02:29:54.419+00', NULL, '604612615536115712'), ('664816340996980736', '附件管理', '1', '1', 'file_manage', '997', 'fileManage', '0', '', '0', '1', 'MelIconFiles', '0', '0', '1', NULL, '115', '140', '', '2026-01-09 13:02:47.384+00', '2026-09-18 02:29:54.419+00', '604612615536115712', '604612615536115712'), ('701403170512830464', '控制台', '2', '1', 'dashboard', '999', 'index', '0', 'index/index', '0', '1', 'MeIconDashboard', '1', '0', '1', '', '1', '2', '', '2026-04-20 12:05:47.292+00', '2026-09-18 02:29:54.418+00', '604612615536115712', '604612615536115712'), ('719446778558021632', '组织', '2', '1', 'system_organization', '98', '/system/organization', '0', 'system/organization/index', '0', '0', 'MelIconList', '0', '0', '1', '1', '16', '31', '', '2026-06-09 07:04:38.684+00', '2026-09-18 02:29:54.415+00', NULL, '604612615536115712'), ('719446779690483712', '列表', '3', '1', 'system_organization_list', '99', '', '0', '', '0', '0', '', '0', '0', '1', '719446778558021632', '17', '18', '', '2026-06-09 07:04:38.953+00', '2026-09-18 02:29:54.414+00', NULL, '604612615536115712'), ('719446780197994496', '详情', '3', '1', 'system_organization_info', '98', '', '0', '', '0', '0', '', '0', '0', '1', '719446778558021632', '19', '20', '', '2026-06-09 07:04:39.074+00', '2026-09-18 02:29:54.414+00', NULL, '604612615536115712'), ('719446780625813504', '新增', '3', '1', 'system_organization_add', '97', '', '0', '', '0', '0', '', '0', '0', '1', '719446778558021632', '21', '22', '', '2026-06-09 07:04:39.176+00', '2026-09-18 02:29:54.415+00', NULL, '604612615536115712'), ('719446781074604032', '编辑', '3', '1', 'system_organization_edit', '96', '', '0', '', '0', '0', '', '0', '0', '1', '719446778558021632', '23', '24', '', '2026-06-09 07:04:39.284+00', '2026-09-18 02:29:54.414+00', NULL, '604612615536115712'), ('719446781531783168', '删除', '3', '1', 'system_organization_del', '95', '', '0', '', '0', '0', '', '0', '0', '1', '719446778558021632', '25', '26', '', '2026-06-09 07:04:39.392+00', '2026-09-18 02:29:54.415+00', NULL, '604612615536115712'), ('742297136913186816', '队列任务', '2', '1', 'job', '99', '/job', '0', 'job/index', '0', '0', 'MelIconList', '0', '0', '1', NULL, '179', '192', '', '2026-08-11 08:23:48.655+00', '2026-09-18 02:29:54.418+00', NULL, '604612615536115712'), ('742297138695766016', '列表', '3', '1', 'job_list', '99', '', '0', '', '0', '0', '', '0', '0', '1', '742297136913186816', '180', '181', '', '2026-08-11 08:23:49.079+00', '2026-09-18 02:29:54.418+00', NULL, '604612615536115712'), ('742297139157139456', '详情', '3', '1', 'job_info', '98', '', '0', '', '0', '0', '', '0', '0', '1', '742297136913186816', '182', '183', '', '2026-08-11 08:23:49.189+00', '2026-09-18 02:29:54.418+00', NULL, '604612615536115712'), ('742297139618512896', '新增', '3', '1', 'job_add', '97', '', '0', '', '0', '0', '', '0', '0', '1', '742297136913186816', '184', '185', '', '2026-08-11 08:23:49.299+00', '2026-09-18 02:29:54.418+00', NULL, '604612615536115712'), ('742297140071497728', '启动', '3', '1', 'job_start', '95', '', '0', '', '0', '0', 'MelIconOpen', '0', '0', '1', '742297136913186816', '188', '189', '', '2026-08-11 08:23:49.407+00', '2026-09-18 02:29:54.418+00', NULL, '604612615536115712'), ('742297140545454080', '删除', '3', '1', 'job_del', '96', '', '0', '', '0', '0', '', '0', '0', '1', '742297136913186816', '186', '187', '', '2026-08-11 08:23:49.52+00', '2026-09-18 02:29:54.418+00', NULL, '604612615536115712'), ('747780486675300352', '停止', '3', '1', 'job_stop', '94', '', '0', '', '0', '1', 'MelIconTurnOff', '0', '0', '1', '742297136913186816', '190', '191', '', '2026-08-26 11:32:41.114+00', '2026-09-18 02:29:54.418+00', '604612615536115712', '604612615536115712'), ('753838055642628096', '多级菜单测试1', '1', '1', 'menu1', '1000', '/menu1', '0', '', '0', '1', 'MelIconList', '0', '0', '1', '664033965581008896', '154', '165', '', '2026-09-12 04:43:18.099+00', '2026-09-18 02:29:54.413+00', '604612615536115712', '604612615536115712'), ('753838717554130944', '多级菜单1-2', '2', '1', 'menu1-2', '998', 'menu1-2', '0', 'example/demo/index', '0', '1', 'MelIconList', '0', '0', '1', '753838055642628096', '157', '158', '', '2026-09-12 04:45:55.911+00', '2026-09-18 02:29:54.413+00', '604612615536115712', '604612615536115712'), ('754242324053098496', '添加关联用户', '3', '1', 'system_organization_add_user', '94', '', '0', '', '0', '1', 'MelIconList', '0', '0', '1', '719446778558021632', '27', '28', '', '2026-09-13 07:29:43.2+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('754285047413997568', '多级菜单1-3', '2', '1', 'menu1-3', '997', 'menu1-3', '0', 'example/demo/index', '0', '1', 'MelIconList', '0', '0', '1', '753838055642628096', '159', '160', '', '2026-09-13 10:19:29.242+00', '2026-09-18 02:29:54.413+00', '604612615536115712', '604612615536115712'), ('754285401115459584', '多级菜单1-4', '1', '1', 'menu1-4', '996', 'menu1-4', '0', 'example/demo/index', '0', '1', 'MelIconList', '0', '0', '1', '753838055642628096', '161', '164', '', '2026-09-13 10:20:53.571+00', '2026-09-18 02:29:54.413+00', '604612615536115712', '604612615536115712'), ('754285606355337216', '多级菜单1-4-1', '2', '1', 'menu1-4-1', '999', 'menu1-4-1', '0', 'example/demo/index', '0', '1', 'MelIconList', '0', '0', '1', '754285401115459584', '162', '163', '', '2026-09-13 10:21:42.505+00', '2026-09-18 02:29:54.413+00', '604612615536115712', '604612615536115712'), ('754305706844225536', '多级菜单1-1', '2', '1', 'menu1-1', '999', 'menu1-1', '0', 'example/demo/index', '0', '1', 'MelIconList', '0', '0', '1', '753838055642628096', '155', '156', '', '2026-09-13 11:41:34.834+00', '2026-09-18 02:29:54.413+00', '604612615536115712', '604612615536115712'), ('754320714072326144', '修复树关系', '3', '1', 'system_menu_perfect_tree', '1', '', '0', '', '0', '1', '', '0', '0', '1', '3', '59', '60', '', '2026-09-13 12:41:12.837+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('754320714852466688', '修复树关系', '3', '1', 'system_organization_perfect_tree', '1', '', '0', '', '0', '1', '', '0', '0', '1', '719446778558021632', '29', '30', '', '2026-09-13 12:41:13.022+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('754320715573886976', '修复树关系', '3', '1', 'system_role_perfect_tree', '1', '', '0', '', '0', '1', '', '0', '0', '1', '664798918835437568', '44', '45', '', '2026-09-13 12:41:13.194+00', '2026-09-18 02:29:54.415+00', '604612615536115712', '604612615536115712'), ('754346487625809920', '系统配置', '2', '1', 'system_config', '97', '/system/config', '0', 'system/config/index', '0', '1', 'MelIconSetting', '0', '0', '1', '1', '62', '95', '', '2026-09-13 14:23:37.731+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('754346488292704256', '列表', '3', '1', 'system_config_list', '100', '', '0', '', '0', '0', 'MelIconList', '0', '0', '1', '754346487625809920', '63', '64', '', '2026-09-13 14:23:37.889+00', '2026-09-18 02:29:54.413+00', '604612615536115712', '604612615536115712'), ('754346488909266944', '详情', '3', '1', 'system_config_info', '99', '', '0', '', '0', '0', 'MelIconList', '0', '0', '1', '754346487625809920', '65', '66', '', '2026-09-13 14:23:38.036+00', '2026-09-18 02:29:54.413+00', '604612615536115712', '604612615536115712'), ('754710314548723712', '新增配置组', '3', '1', 'system_config_group_add', '88', '', '0', '', '0', '0', 'MelIconList', '0', '0', '1', '755095763259752448', '82', '83', '', '2026-09-14 14:29:20.828+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('754710315110760448', '编辑配置组', '3', '1', 'system_config_group_edit', '87', '', '0', '', '0', '0', 'MelIconList', '0', '0', '1', '755095763259752448', '84', '85', '', '2026-09-14 14:29:20.962+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('754710315660214272', '删除配置组', '3', '1', 'system_config_group_del', '86', '', '0', '', '0', '0', 'MelIconList', '0', '0', '1', '755095763259752448', '86', '87', '', '2026-09-14 14:29:21.093+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('754710316213862400', '新增配置字段', '3', '1', 'system_config_field_add', '85', '', '0', '', '0', '0', 'MelIconList', '0', '0', '1', '755095763259752448', '88', '89', '', '2026-09-14 14:29:21.225+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('754710316767510528', '编辑配置字段', '3', '1', 'system_config_field_edit', '84', '', '0', '', '0', '0', 'MelIconList', '0', '0', '1', '755095763259752448', '90', '91', '', '2026-09-14 14:29:21.357+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('754710317321158656', '删除配置字段', '3', '1', 'system_config_field_del', '83', '', '0', '', '0', '0', 'MelIconList', '0', '0', '1', '755095763259752448', '92', '93', '', '2026-09-14 14:29:21.489+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('754710317916749824', '修改配置', '3', '1', 'system_config_value_edit', '82', '', '0', '', '0', '0', 'MelIconList', '0', '0', '1', '754346487625809920', '67', '68', '', '2026-09-14 14:29:21.631+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('755095762555109376', '字典配置', '1', '1', 'system_config_dict', '80', '', '0', '', '1', '0', 'MelIconList', '0', '0', '1', '754346487625809920', '69', '78', '', '2026-09-15 16:00:58.794+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('755095763259752448', '配置组管理', '1', '1', 'system_config_group', '70', '', '0', '', '1', '0', 'MelIconList', '0', '0', '1', '754346487625809920', '79', '94', '', '2026-09-15 16:00:58.963+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('755101402446954496', '新增字典', '3', '1', 'system_config_dict_add', '85', '', '0', '', '0', '0', '', '0', '0', '1', '755095762555109376', '72', '73', '', '2026-09-15 16:23:23.449+00', '2026-09-18 02:29:54.413+00', '604612615536115712', '604612615536115712'), ('755101403113848832', '编辑字典', '3', '1', 'system_config_dict_edit', '84', '', '0', '', '0', '0', '', '0', '0', '1', '755095762555109376', '74', '75', '', '2026-09-15 16:23:23.608+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('755101403734605824', '删除字典', '3', '1', 'system_config_dict_del', '83', '', '0', '', '0', '0', '', '0', '0', '1', '755095762555109376', '76', '77', '', '2026-09-15 16:23:23.756+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('755237799904411648', '查看字典配置', '3', '1', 'system_config_dict_list', '999', '', '0', '', '0', '1', 'MelIconList', '0', '0', '1', '755095762555109376', '70', '71', '', '2026-09-16 01:25:23.138+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('755237961372532736', '查看配置组', '3', '1', 'system_config_group_list', '999', '', '0', '', '0', '1', 'MelIconList', '0', '0', '1', '755095763259752448', '80', '81', '', '2026-09-16 01:26:01.635+00', '2026-09-18 02:29:54.414+00', '604612615536115712', '604612615536115712'), ('830261019000000001', '站点与伪静态', '2', '1', 'system_site', '50', '/system/site', '0', 'system/site/index', '0', '0', '', '0', '0', '1', '1', '96', '113', '', '2026-10-19 11:23:34.312912+00', '2026-10-19 11:23:34.312912+00', NULL, NULL), ('830261019000000002', '站点列表', '3', '1', 'system_site_list', '50', '', '0', '', '0', '0', '', '0', '0', '1', '830261019000000001', '97', '98', '', '2026-10-19 11:23:34.312912+00', '2026-10-19 11:23:34.312912+00', NULL, NULL), ('830261019000000003', '站点新增', '3', '1', 'system_site_add', '50', '', '0', '', '0', '0', '', '0', '0', '1', '830261019000000001', '99', '100', '', '2026-10-19 11:23:34.312912+00', '2026-10-19 11:23:34.312912+00', NULL, NULL), ('830261019000000004', '站点编辑', '3', '1', 'system_site_edit', '50', '', '0', '', '0', '0', '', '0', '0', '1', '830261019000000001', '101', '102', '', '2026-10-19 11:23:34.312912+00', '2026-10-19 11:23:34.312912+00', NULL, NULL), ('830261019000000005', '站点删除', '3', '1', 'system_site_del', '50', '', '0', '', '0', '0', '', '0', '0', '1', '830261019000000001', '103', '104', '', '2026-10-19 11:23:34.312912+00', '2026-10-19 11:23:34.312912+00', NULL, NULL), ('830261019000000006', '规则列表', '3', '1', 'system_rewrite_list', '50', '', '0', '', '0', '0', '', '0', '0', '1', '830261019000000001', '105', '106', '', '2026-10-19 11:23:34.312912+00', '2026-10-19 11:23:34.312912+00', NULL, NULL), ('830261019000000007', '规则新增', '3', '1', 'system_rewrite_add', '50', '', '0', '', '0', '0', '', '0', '0', '1', '830261019000000001', '107', '108', '', '2026-10-19 11:23:34.312912+00', '2026-10-19 11:23:34.312912+00', NULL, NULL), ('830261019000000008', '规则编辑', '3', '1', 'system_rewrite_edit', '50', '', '0', '', '0', '0', '', '0', '0', '1', '830261019000000001', '109', '110', '', '2026-10-19 11:23:34.312912+00', '2026-10-19 11:23:34.312912+00', NULL, NULL), ('830261019000000009', '规则删除', '3', '1', 'system_rewrite_del', '50', '', '0', '', '0', '0', '', '0', '0', '1', '830261019000000001', '111', '112', '', '2026-10-19 11:23:34.312912+00', '2026-10-19 11:23:34.312912+00', NULL, NULL);
CREATE UNIQUE INDEX system_menu_rule_unique ON system_menu USING btree (rule);

CREATE TABLE "system_organization" (
  "id" character varying(20) NOT NULL,
  "org_name" character varying(50) NOT NULL DEFAULT ''::character varying,
  "order_num" smallint NOT NULL DEFAULT 0,
  "status" smallint NOT NULL DEFAULT 1,
  "remark" character varying(100) NOT NULL DEFAULT ''::character varying,
  "leader" character varying(100) NOT NULL DEFAULT ''::character varying,
  "phone" character varying(100) NOT NULL DEFAULT ''::character varying,
  "email" character varying(100) NOT NULL DEFAULT ''::character varying,
  "parent_id" character varying(100),
  "left" bigint,
  "right" bigint,
  "lock_version" character varying(100) NOT NULL DEFAULT ''::character varying,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  CONSTRAINT "system_organization_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "system_organization" IS '组织表';
COMMENT ON COLUMN "system_organization"."org_name" IS '组织名称';
COMMENT ON COLUMN "system_organization"."order_num" IS '排序(降序)';
COMMENT ON COLUMN "system_organization"."status" IS '状态:1=启用;0=禁用';
COMMENT ON COLUMN "system_organization"."remark" IS '备注';
COMMENT ON COLUMN "system_organization"."leader" IS '负责人';
COMMENT ON COLUMN "system_organization"."phone" IS '联系电话';
COMMENT ON COLUMN "system_organization"."email" IS '邮箱';
COMMENT ON COLUMN "system_organization"."parent_id" IS '父级id';
COMMENT ON COLUMN "system_organization"."left" IS '左树边界';
COMMENT ON COLUMN "system_organization"."right" IS '右树边界';
COMMENT ON COLUMN "system_organization"."lock_version" IS '锁版本号';
COMMENT ON COLUMN "system_organization"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "system_organization"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "system_organization"."created_at" IS '创建时间';
COMMENT ON COLUMN "system_organization"."updated_at" IS '最后更新时间';
INSERT INTO "system_organization" ("id", "org_name", "order_num", "status", "remark", "leader", "phone", "email", "parent_id", "left", "right", "lock_version", "created_admin_id", "updated_admin_id", "created_at", "updated_at") VALUES ('740174696351268864', '总公司', '0', '1', '', '', '', '', '', '1', '12', '', '604612615536115712', '604612615536115712', '2026-08-05 11:49:59.391+00', '2026-09-13 12:43:27.823+00'), ('740175409059987456', '山东分公司', '0', '1', '', '', '', '', '740174696351268864', '6', '11', '', '604612615536115712', '604612615536115712', '2026-08-05 11:52:49.314+00', '2026-09-13 12:43:27.823+00'), ('740175473295753216', '河南分公司', '998', '1', '', '', '', '', '740174696351268864', '4', '5', '', '604612615536115712', '604612615536115712', '2026-08-05 11:53:04.629+00', '2026-09-13 12:43:27.822+00'), ('740175601565958144', '广东分公司', '997', '1', '', '', '', '', '740174696351268864', '2', '3', '', '604612615536115712', '604612615536115712', '2026-08-05 11:53:35.212+00', '2026-09-13 12:43:27.822+00'), ('740176007411007488', '济南分公司', '0', '1', '', '', '', '', '740175409059987456', '9', '10', '', '604612615536115712', '632899190933946368', '2026-08-05 11:55:11.972+00', '2026-09-13 12:43:27.823+00'), ('740176056484364288', '聊城分公司', '999', '1', '', '', '', '', '740175409059987456', '7', '8', '', '604612615536115712', '604612615536115712', '2026-08-05 11:55:23.672+00', '2026-09-13 12:43:27.823+00');

CREATE TABLE "system_rewrite" (
  "id" character varying(20) NOT NULL,
  "site_id" character varying(20) NOT NULL,
  "pattern" character varying(500) NOT NULL DEFAULT ''::character varying,
  "target" character varying(500) NOT NULL DEFAULT ''::character varying,
  "status" smallint NOT NULL DEFAULT 1,
  "order_num" smallint NOT NULL DEFAULT 0,
  "remark" character varying(500) NOT NULL DEFAULT ''::character varying,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  CONSTRAINT "system_rewrite_pkey" PRIMARY KEY (id)
);
COMMENT ON COLUMN "system_rewrite"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "system_rewrite"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "system_rewrite"."created_at" IS '创建时间';
COMMENT ON COLUMN "system_rewrite"."updated_at" IS '最后更新时间';
CREATE INDEX system_rewrite_site_idx ON system_rewrite USING btree (site_id, status, order_num);

CREATE TABLE "system_role" (
  "id" character varying(20) NOT NULL,
  "role_name" character varying(50) NOT NULL DEFAULT ''::character varying,
  "role_key" character varying(50) NOT NULL DEFAULT ''::character varying,
  "order_num" smallint NOT NULL DEFAULT 0,
  "status" smallint NOT NULL DEFAULT 1,
  "remark" character varying(100) NOT NULL DEFAULT ''::character varying,
  "parent_id" character varying(100),
  "left" bigint,
  "right" bigint,
  "lock_version" character varying(100) NOT NULL DEFAULT ''::character varying,
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "is_super" smallint NOT NULL DEFAULT 0,
  "data_scope" smallint NOT NULL DEFAULT 3,
  CONSTRAINT "system_role_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "system_role" IS '角色表';
COMMENT ON COLUMN "system_role"."role_name" IS '角色名称';
COMMENT ON COLUMN "system_role"."role_key" IS '角色标识';
COMMENT ON COLUMN "system_role"."order_num" IS '排序(降序)';
COMMENT ON COLUMN "system_role"."status" IS '状态:1=启用;0=禁用';
COMMENT ON COLUMN "system_role"."remark" IS '备注';
COMMENT ON COLUMN "system_role"."parent_id" IS '父级id';
COMMENT ON COLUMN "system_role"."left" IS '左树边界';
COMMENT ON COLUMN "system_role"."right" IS '右树边界';
COMMENT ON COLUMN "system_role"."lock_version" IS '锁版本号';
COMMENT ON COLUMN "system_role"."created_at" IS '创建时间';
COMMENT ON COLUMN "system_role"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "system_role"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "system_role"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "system_role"."is_super" IS '超级管理员:1=是;0=不是';
COMMENT ON COLUMN "system_role"."data_scope" IS '数据权限:1=全部;2=组织;3=组织及以下;4=仅本人';
INSERT INTO "system_role" ("id", "role_name", "role_key", "order_num", "status", "remark", "parent_id", "left", "right", "lock_version", "created_at", "updated_at", "created_admin_id", "updated_admin_id", "is_super", "data_scope") VALUES ('635392868638261248', '超级管理员', 'super_admin', '999', '1', '', '', '1', '12', '', '2025-10-20 08:24:24.912+00', '2026-09-13 06:36:54.841+00', '604612615536115712', '604612615536115712', '1', '3'), ('635419154098159616', '二级管理员', 'tow_admin', '0', '1', '', '635392868638261248', '2', '9', '', '2025-10-20 10:08:51.855+00', '2026-09-13 06:36:54.81+00', '604612615536115712', '604612615536115712', '0', '3'), ('635419305097297920', '二级管理员2', 'tow_admin2', '0', '1', '', '635392868638261248', '10', '11', '', '2025-10-20 10:09:27.855+00', '2026-09-13 06:36:54.876+00', '604612615536115712', '604612615536115712', '0', '3'), ('635419444721483776', '三级管理员2', 'three_admin3', '997', '1', '', '635419154098159616', '3', '4', '', '2025-10-20 10:10:01.144+00', '2026-09-13 06:36:54.81+00', '604612615536115712', '604612615536115712', '0', '3'), ('635419686065930240', '三级管理员', 'three_admin', '999', '1', '', '635419154098159616', '5', '6', '', '2025-10-20 10:10:58.686+00', '2026-09-13 06:36:54.81+00', '604612615536115712', '604612615536115712', '0', '3'), ('635424437604188160', '三级管理员1', 'three_admin1', '0', '1', '', '635419154098159616', '7', '8', '', '2025-10-20 10:29:51.54+00', '2026-09-13 06:36:54.81+00', '604612615536115712', '604612615536115712', '0', '3');
CREATE UNIQUE INDEX system_role_role_key_unique ON system_role USING btree (role_key);

CREATE TABLE "system_site" (
  "id" character varying(20) NOT NULL,
  "name" character varying(100) NOT NULL DEFAULT ''::character varying,
  "domains" text NOT NULL DEFAULT '[]'::text,
  "base_path" character varying(500) NOT NULL DEFAULT ''::character varying,
  "status" smallint NOT NULL DEFAULT 1,
  "order_num" smallint NOT NULL DEFAULT 0,
  "remark" character varying(500) NOT NULL DEFAULT ''::character varying,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  CONSTRAINT "system_site_pkey" PRIMARY KEY (id)
);
COMMENT ON COLUMN "system_site"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "system_site"."updated_admin_id" IS '最后更新者(管理员)Id';
COMMENT ON COLUMN "system_site"."created_at" IS '创建时间';
COMMENT ON COLUMN "system_site"."updated_at" IS '最后更新时间';
CREATE INDEX system_site_status_idx ON system_site USING btree (status, order_num);

CREATE TABLE "user" (
  "id" character varying(20) NOT NULL,
  "username" character varying(50) NOT NULL DEFAULT ''::character varying,
  "nickname" character varying(20) NOT NULL DEFAULT ''::character varying,
  "password" character varying(64) NOT NULL DEFAULT ''::character varying,
  "salt" character varying(32) NOT NULL DEFAULT ''::character varying,
  "avatar_file_id" character varying(20),
  "email" character varying(100) DEFAULT NULL::character varying,
  "mobile" character varying(11) DEFAULT NULL::character varying,
  "login_failure" smallint NOT NULL DEFAULT 0,
  "last_login_at" timestamp with time zone,
  "last_login_ip" character varying(50) NOT NULL DEFAULT ''::character varying,
  "status" smallint NOT NULL DEFAULT 1,
  "deleted_at" timestamp(6) with time zone,
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  "created_user_id" character varying(20),
  "updated_user_id" character varying(20),
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  CONSTRAINT "user_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "user" IS '用户表';
COMMENT ON COLUMN "user"."username" IS '用户名';
COMMENT ON COLUMN "user"."nickname" IS '昵称';
COMMENT ON COLUMN "user"."password" IS '密码';
COMMENT ON COLUMN "user"."salt" IS '密码盐';
COMMENT ON COLUMN "user"."avatar_file_id" IS '头像附件id';
COMMENT ON COLUMN "user"."email" IS '邮箱';
COMMENT ON COLUMN "user"."mobile" IS '手机号';
COMMENT ON COLUMN "user"."login_failure" IS '登录失败次数';
COMMENT ON COLUMN "user"."last_login_at" IS '登录时间';
COMMENT ON COLUMN "user"."last_login_ip" IS '登录ip';
COMMENT ON COLUMN "user"."status" IS '状态:1=启用;0=禁用';
COMMENT ON COLUMN "user"."deleted_at" IS '删除时间';
COMMENT ON COLUMN "user"."created_at" IS '创建时间';
COMMENT ON COLUMN "user"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "user"."created_user_id" IS '创建者(用户)Id';
COMMENT ON COLUMN "user"."updated_user_id" IS '最后更新者(用户)Id';
COMMENT ON COLUMN "user"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "user"."updated_admin_id" IS '最后更新者(管理员)Id';
INSERT INTO "user" ("id", "username", "nickname", "password", "salt", "avatar_file_id", "email", "mobile", "login_failure", "last_login_at", "last_login_ip", "status", "deleted_at", "created_at", "updated_at", "created_user_id", "updated_user_id", "created_admin_id", "updated_admin_id") VALUES ('657558079876890624', 'test', '测试账户', '0872954db1998fff1a92b4ff42f8f9aeb2932e67d0c7fb96e31dfa3db3504ec5', 'c10ebfb00d8075bb9045d74b3affc81e', '755976093718020096', '1111@qq.com', NULL, '0', NULL, '', '1', NULL, '2025-12-20 12:21:03.082+00', '2026-09-18 02:19:07.507+00', NULL, '657558079876890624', NULL, '604612615536115712'), ('757593885013704704', 'cms57586', 'CMS演示用户', '9cd20bf5016c18255b2414a01c70452d194b549548d001d3873eba5d6b0e0bbf', '9b1203fbc37353bc2a4db5e923c31e68', NULL, NULL, NULL, '0', NULL, '', '1', NULL, '2026-09-22 13:27:37.602+00', '2026-09-22 13:27:37.602+00', NULL, NULL, NULL, NULL), ('757594002051563520', 'cms85490', 'CMS演示用户', 'c5cd5dd5fa4295d38a9eb3748bf60675488c17ca95172eb69d8538bf0f364338', 'fcec3112867860e3ef3746093cb6b20b', NULL, NULL, NULL, '0', NULL, '', '1', NULL, '2026-09-22 13:28:05.506+00', '2026-09-22 13:28:05.506+00', NULL, NULL, NULL, NULL), ('757606980255744000', 'cms79725', 'CMS验收用户', '812c14084f3332c4bb5794cd0558793127d9b4c5dc1439f7c5b1d013fc0a5294', 'c00b0b530dc70dc1eb4b30ec1780dadc', NULL, NULL, NULL, '0', NULL, '', '1', NULL, '2026-09-22 14:19:39.751+00', '2026-09-22 14:19:39.751+00', NULL, NULL, NULL, NULL), ('757767923048644608', 'cmsreply51465', '评论验收用户', '657da28eb5b1662578210d35dc2d51a2b1fd04b79f274a246b5a0f7d587c399a', 'bbb271e7e0661c1eff08d76028560836', NULL, NULL, NULL, '0', NULL, '', '1', NULL, '2026-09-23 00:59:11.503+00', '2026-09-23 00:59:11.503+00', NULL, NULL, NULL, NULL), ('761148970620682240', 'cmsfront931256047', '前台验收用户', 'c9b7765e8fe411fcf1c8958b13fe76a51ed657bacd81f4ac588aca1f1c598c34', 'a448de0bf8bf489d2821f6563b9d7352', NULL, NULL, NULL, '0', NULL, '', '1', '2026-10-11 11:17:44.408+00', '2026-10-02 08:54:16.06+00', '2026-10-11 11:17:44.408+00', NULL, NULL, NULL, NULL), ('761149342974214144', 'cf1344823', '前台验收用户', '5f8feae880b8f05160e25b3039cbc4658df694b5f7c8c298025deb8ff22761b6', '136cfee2542abbef89a6f8195c39e861', NULL, NULL, NULL, '0', NULL, '', '1', '2026-10-11 11:17:44.27+00', '2026-10-02 08:55:44.836+00', '2026-10-11 11:17:44.27+00', NULL, NULL, NULL, NULL), ('763352046635057152', 'cf6510300', '前台验收用户', 'cfe2cbbaa1dde01e020bcb96feb992ca54e505ac2cefcbe8fa1b1c8d14b67073', '2fb91c65fcbb2121ad11dc68bbe9c4b1', NULL, NULL, NULL, '0', NULL, '', '1', '2026-10-11 11:17:44.111+00', '2026-10-08 10:48:30.314+00', '2026-10-11 11:17:44.111+00', NULL, NULL, NULL, NULL), ('763352846832762880', 'cf6701079', '前台验收用户', '0fd28176a0fb573bf9750b087889059e6fb84b75c51ecf193ae3c10227d02eec', '753ca19cbe639c718aa46cff138ac3e9', NULL, NULL, NULL, '0', NULL, '', '1', '2026-10-11 11:17:43.974+00', '2026-10-08 10:51:41.095+00', '2026-10-11 11:17:43.974+00', NULL, NULL, NULL, NULL), ('763353450573463552', 'cf6845022', '前台验收用户', '632f6e95a199a5612ed9544c3fd04b24d2a909b829d71ea864ed68fa51769f84', '86a1023de87234f8584f5196d34ef980', NULL, NULL, NULL, '0', NULL, '', '1', '2026-10-11 11:17:43.842+00', '2026-10-08 10:54:05.038+00', '2026-10-11 11:17:43.842+00', NULL, NULL, NULL, NULL), ('763353866791026688', 'cf6944255', '前台验收用户', '702336df83d6965af3fe0e127968a4ba9d54b8072f4d430060be6a13e6e878ef', '1d5ad81ffa1fc59ce09ebaa28ac439e5', NULL, NULL, NULL, '0', NULL, '', '1', '2026-10-11 11:17:43.696+00', '2026-10-08 10:55:44.272+00', '2026-10-11 11:17:43.696+00', NULL, NULL, NULL, NULL), ('763354059661901824', 'cf6990241', '前台验收用户', 'bfbb0523b70c592693801ab049f142521413cfefc4004080e2bfd8bf63c300bd', '21a895c6ba9d31eb4fa50237318a91be', NULL, NULL, NULL, '0', NULL, '', '1', '2026-10-11 11:17:43.559+00', '2026-10-08 10:56:30.256+00', '2026-10-11 11:17:43.559+00', NULL, NULL, NULL, NULL), ('763369530402537472', 'cf0678752', '前台验收用户', 'e11579ca076f1aa42d25f838916afea6d7a1b76f3ddab227dafbedb5f00b25cb', '038f4a90ecdb00d395da65e209d13ad7', NULL, NULL, NULL, '0', NULL, '', '1', '2026-10-11 11:17:43.412+00', '2026-10-08 11:57:58.768+00', '2026-10-11 11:17:43.412+00', NULL, NULL, NULL, NULL), ('764443485519478784', 'cf6727445', '前台验收用户', 'b6fc25dfdd1429940e8f38f0d2ecd954236aec0adbfe372e7ddf147ce2e9dab5', '18412a07fd4a8eb0b35ed87ca6e90450', NULL, NULL, NULL, '0', NULL, '', '1', '2026-10-11 11:17:43.265+00', '2026-10-11 11:05:29.621+00', '2026-10-11 11:17:43.265+00', NULL, NULL, NULL, NULL), ('764460090135674880', 'cf0688453', '前台验收用户', '74a5875f6a9040161ecd8df3f857e0716d08c87ca5aea18612b67a8d4dfd34c3', '99807831e7431d842fb656e4fba6810f', NULL, NULL, NULL, '0', NULL, '', '1', NULL, '2026-10-11 12:11:28.47+00', '2026-10-11 12:11:28.47+00', NULL, NULL, NULL, NULL);
CREATE UNIQUE INDEX user_email_unique ON "user" USING btree (email) WHERE (deleted_at IS NOT NULL);
CREATE UNIQUE INDEX user_mobile_unique ON "user" USING btree (mobile) WHERE (deleted_at IS NOT NULL);
CREATE UNIQUE INDEX user_username_unique ON "user" USING btree (username) WHERE (deleted_at IS NOT NULL);

CREATE TABLE "user_file" (
  "id" character varying(20) NOT NULL,
  "name" character varying(300) NOT NULL DEFAULT ''::character varying,
  "path" character varying(200) NOT NULL DEFAULT ''::character varying,
  "mime_type" character varying(50) NOT NULL DEFAULT ''::character varying,
  "size" integer,
  "storage" character varying(50) NOT NULL DEFAULT 'storage'::character varying,
  "md5" character varying(32) NOT NULL DEFAULT ''::character varying,
  "created_user_id" character varying(20),
  "updated_user_id" character varying(20),
  "created_at" timestamp(6) with time zone NOT NULL,
  "updated_at" timestamp(6) with time zone NOT NULL,
  "created_admin_id" character varying(20),
  "updated_admin_id" character varying(20),
  CONSTRAINT "user_file_pkey" PRIMARY KEY (id)
);
COMMENT ON TABLE "user_file" IS '用户附件表(前台)';
COMMENT ON COLUMN "user_file"."name" IS '文件名';
COMMENT ON COLUMN "user_file"."path" IS '路径';
COMMENT ON COLUMN "user_file"."mime_type" IS 'mime类型';
COMMENT ON COLUMN "user_file"."size" IS '文件大小(b)';
COMMENT ON COLUMN "user_file"."storage" IS '存储引擎';
COMMENT ON COLUMN "user_file"."md5" IS '文件MD5值';
COMMENT ON COLUMN "user_file"."created_user_id" IS '创建者(用户)Id';
COMMENT ON COLUMN "user_file"."updated_user_id" IS '最后更新者(用户)Id';
COMMENT ON COLUMN "user_file"."created_at" IS '创建时间';
COMMENT ON COLUMN "user_file"."updated_at" IS '最后更新时间';
COMMENT ON COLUMN "user_file"."created_admin_id" IS '创建者(管理员)Id';
COMMENT ON COLUMN "user_file"."updated_admin_id" IS '最后更新者(管理员)Id';
INSERT INTO "user_file" ("id", "name", "path", "mime_type", "size", "storage", "md5", "created_user_id", "updated_user_id", "created_at", "updated_at", "created_admin_id", "updated_admin_id") VALUES ('694463724789956608', 'logo.png', 'c99e23ad65db6db5bea03d828fb6166e.png', 'image/png', '356830', 'local', 'c99e23ad65db6db5bea03d828fb6166e', '657558079876890624', '657558079876890624', '2026-04-01 08:30:54.503+00', '2026-04-01 08:30:54.503+00', NULL, NULL), ('755976093718020096', 'A_minimalist_flat_illustration_2026-09-18T02-17-25.png', 'b0faa183985a2a91a49fbdf94091b4cd.png', 'image/png', '442831', 'local', 'b0faa183985a2a91a49fbdf94091b4cd', NULL, NULL, '2026-09-18 02:19:06.099+00', '2026-09-18 02:19:06.099+00', '604612615536115712', '604612615536115712');
