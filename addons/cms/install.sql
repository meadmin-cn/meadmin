-- CMS 插件安装脚本（表结构 + 后台权限菜单 + 演示数据，一步到位）。
-- 已合并全部历史迁移，全新项目执行一次即可得到当前演示效果。
-- 注意：默认 schema 为 meadmin，部署前请按实际 schema 调整下方 search_path。
BEGIN;
SET LOCAL search_path TO meadmin;

CREATE TABLE IF NOT EXISTS aon_cms_article (
  id varchar(20) NOT NULL,
  title varchar(200) DEFAULT '' NOT NULL,
  slug varchar(120) DEFAULT '' NOT NULL,
  summary varchar(1000) DEFAULT '' NOT NULL,
  html_content text DEFAULT '' NOT NULL,
  cover_url varchar(1000) DEFAULT '' NOT NULL,
  seo_title varchar(200) DEFAULT '' NOT NULL,
  seo_keywords varchar(200) DEFAULT '' NOT NULL,
  seo_description varchar(500) DEFAULT '' NOT NULL,
  status smallint DEFAULT 0 NOT NULL,
  publish_at timestamptz,
  order_num smallint DEFAULT 0 NOT NULL,
  category_id varchar(20) DEFAULT NULL,
  topic_id varchar(20) DEFAULT NULL,
  tag_ids varchar[] DEFAULT '{}' NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  views integer DEFAULT 0 NOT NULL,
  likes integer DEFAULT 0 NOT NULL,
  comments integer DEFAULT 0 NOT NULL,
  order_enabled boolean DEFAULT false NOT NULL,
  is_download boolean DEFAULT false NOT NULL,
  file_url varchar(1000) DEFAULT '' NOT NULL,
  file_name varchar(200) DEFAULT '' NOT NULL,
  downloads integer DEFAULT 0 NOT NULL,
  is_gallery boolean DEFAULT false NOT NULL,
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_article_slug_unique' AND conrelid='aon_cms_article'::regclass) THEN ALTER TABLE aon_cms_article ADD CONSTRAINT aon_cms_article_slug_unique UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_article_cms_check_1' AND conrelid='aon_cms_article'::regclass) THEN ALTER TABLE aon_cms_article ADD CONSTRAINT aon_cms_article_cms_check_1 CHECK ((status = ANY (ARRAY[0, 1, 2, 3, 4]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_article_cms_check_2' AND conrelid='aon_cms_article'::regclass) THEN ALTER TABLE aon_cms_article ADD CONSTRAINT aon_cms_article_cms_check_2 CHECK (((status <> 2) OR (publish_at IS NOT NULL))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_article_publish_idx ON aon_cms_article USING btree (status, publish_at);
CREATE INDEX IF NOT EXISTS aon_cms_article_category_idx ON aon_cms_article USING btree (category_id);
CREATE INDEX IF NOT EXISTS aon_cms_article_topic_idx ON aon_cms_article USING btree (topic_id);
CREATE INDEX IF NOT EXISTS aon_cms_article_tags_idx ON aon_cms_article USING gin (tag_ids);
CREATE INDEX IF NOT EXISTS aon_cms_article_created_idx ON aon_cms_article USING btree (created_at);

CREATE TABLE IF NOT EXISTS aon_cms_block (
  id varchar(20) NOT NULL,
  title varchar(200) DEFAULT '' NOT NULL,
  slug varchar(120) DEFAULT '' NOT NULL,
  position varchar(100) DEFAULT '' NOT NULL,
  kind smallint DEFAULT 1 NOT NULL,
  html_content text DEFAULT '' NOT NULL,
  cover_url varchar(1000) DEFAULT '' NOT NULL,
  link varchar(1000) DEFAULT '' NOT NULL,
  status smallint DEFAULT 1 NOT NULL,
  start_at timestamptz,
  end_at timestamptz,
  order_num smallint DEFAULT 0 NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  config text DEFAULT '' NOT NULL,
  display_title varchar(200) DEFAULT '' NOT NULL,
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_block_slug_unique' AND conrelid='aon_cms_block'::regclass) THEN ALTER TABLE aon_cms_block ADD CONSTRAINT aon_cms_block_slug_unique UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_block_cms_check_3' AND conrelid='aon_cms_block'::regclass) THEN ALTER TABLE aon_cms_block ADD CONSTRAINT aon_cms_block_cms_check_3 CHECK (((start_at IS NULL) OR (end_at IS NULL) OR (start_at < end_at))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_block_cms_check_1' AND conrelid='aon_cms_block'::regclass) THEN ALTER TABLE aon_cms_block ADD CONSTRAINT aon_cms_block_cms_check_1 CHECK ((kind = ANY (ARRAY[1, 2, 3]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_block_cms_check_2' AND conrelid='aon_cms_block'::regclass) THEN ALTER TABLE aon_cms_block ADD CONSTRAINT aon_cms_block_cms_check_2 CHECK ((status = ANY (ARRAY[0, 1]))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_block_created_idx ON aon_cms_block USING btree (created_at);

CREATE TABLE IF NOT EXISTS aon_cms_category (
  id varchar(20) NOT NULL,
  title varchar(100) DEFAULT '' NOT NULL,
  slug varchar(120) DEFAULT '' NOT NULL,
  status smallint DEFAULT 1 NOT NULL,
  order_num smallint DEFAULT 0 NOT NULL,
  parent_id varchar(100),
  "left" bigint,
  "right" bigint,
  lock_version varchar(100) DEFAULT '' NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  is_recommend boolean DEFAULT false NOT NULL,
  cover_url varchar(1000) DEFAULT '' NOT NULL,
  type smallint DEFAULT 1 NOT NULL,
  link_url varchar(1000) DEFAULT '' NOT NULL,
  is_nav boolean DEFAULT true NOT NULL,
  target varchar(200) DEFAULT '' NOT NULL,
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_category_slug_unique' AND conrelid='aon_cms_category'::regclass) THEN ALTER TABLE aon_cms_category ADD CONSTRAINT aon_cms_category_slug_unique UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_category_cms_check_1' AND conrelid='aon_cms_category'::regclass) THEN ALTER TABLE aon_cms_category ADD CONSTRAINT aon_cms_category_cms_check_1 CHECK ((status = ANY (ARRAY[0, 1]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_category_cms_check_2' AND conrelid='aon_cms_category'::regclass) THEN ALTER TABLE aon_cms_category ADD CONSTRAINT aon_cms_category_cms_check_2 CHECK (((parent_id)::text IS DISTINCT FROM (id)::text)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_category_type_check' AND conrelid='aon_cms_category'::regclass) THEN ALTER TABLE aon_cms_category ADD CONSTRAINT aon_cms_category_type_check CHECK ((type = ANY (ARRAY[1, 2, 3, 4, 5, 6]))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_category_created_idx ON aon_cms_category USING btree (created_at);

CREATE TABLE IF NOT EXISTS aon_cms_comment (
  id varchar(20) NOT NULL,
  article_id varchar(20) DEFAULT '' NOT NULL,
  author varchar(80) DEFAULT '' NOT NULL,
  content varchar(2000) DEFAULT '' NOT NULL,
  status smallint DEFAULT 0 NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  parent_id varchar(100),
  "left" bigint,
  "right" bigint,
  lock_version varchar(100) DEFAULT '' NOT NULL,
  report_count integer DEFAULT 0 NOT NULL,
  report_reason varchar(500) DEFAULT '' NOT NULL,
  reported_at timestamptz,
  user_id varchar(20) DEFAULT '' NOT NULL,
  author_avatar varchar(1000) DEFAULT '' NOT NULL,
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_comment_cms_check_1' AND conrelid='aon_cms_comment'::regclass) THEN ALTER TABLE aon_cms_comment ADD CONSTRAINT aon_cms_comment_cms_check_1 CHECK ((status = ANY (ARRAY[0, 1, 2]))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_comment_article_idx ON aon_cms_comment USING btree (article_id, status);
CREATE INDEX IF NOT EXISTS aon_cms_comment_created_idx ON aon_cms_comment USING btree (created_at);
CREATE INDEX IF NOT EXISTS aon_cms_comment_parent_idx ON aon_cms_comment USING btree (parent_id);
CREATE INDEX IF NOT EXISTS idx_aon_cms_comment_report_count ON aon_cms_comment USING btree (report_count DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aon_cms_comment_user_id ON aon_cms_comment USING btree (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS aon_cms_comment_report (
  id varchar(20) NOT NULL,
  comment_id varchar(20) DEFAULT '' NOT NULL,
  article_id varchar(20) DEFAULT '' NOT NULL,
  user_id varchar(20) DEFAULT '' NOT NULL,
  reason varchar(500) DEFAULT '' NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS aon_cms_diyform (
  id varchar(20) NOT NULL,
  title varchar(100) DEFAULT '' NOT NULL,
  diyname varchar(120) DEFAULT '' NOT NULL,
  description varchar(500) DEFAULT '' NOT NULL,
  fields text DEFAULT '[]' NOT NULL,
  submit_text varchar(60) DEFAULT '' NOT NULL,
  need_review smallint DEFAULT 1 NOT NULL,
  is_message_board boolean DEFAULT false NOT NULL,
  status smallint DEFAULT 1 NOT NULL,
  order_num smallint DEFAULT 0 NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  category_id varchar(20),
  display_config text DEFAULT '{}' NOT NULL,
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_diyform_diyname_key' AND conrelid='aon_cms_diyform'::regclass) THEN ALTER TABLE aon_cms_diyform ADD CONSTRAINT aon_cms_diyform_diyname_key UNIQUE (diyname); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_diyform_need_review_check' AND conrelid='aon_cms_diyform'::regclass) THEN ALTER TABLE aon_cms_diyform ADD CONSTRAINT aon_cms_diyform_need_review_check CHECK ((need_review = ANY (ARRAY[0, 1]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_diyform_status_check' AND conrelid='aon_cms_diyform'::regclass) THEN ALTER TABLE aon_cms_diyform ADD CONSTRAINT aon_cms_diyform_status_check CHECK ((status = ANY (ARRAY[0, 1]))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_diyform_created_idx ON aon_cms_diyform USING btree (created_at);
CREATE INDEX IF NOT EXISTS aon_cms_diyform_category_idx ON aon_cms_diyform USING btree (category_id);

CREATE TABLE IF NOT EXISTS aon_cms_diyform_data (
  id varchar(20) NOT NULL,
  form_id varchar(20) NOT NULL,
  diyname varchar(120) DEFAULT '' NOT NULL,
  data text DEFAULT '{}' NOT NULL,
  author varchar(80) DEFAULT '' NOT NULL,
  contact varchar(160) DEFAULT '' NOT NULL,
  reply varchar(2000) DEFAULT '' NOT NULL,
  source varchar(60) DEFAULT '' NOT NULL,
  ip varchar(60) DEFAULT '' NOT NULL,
  status smallint DEFAULT 0 NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_diyform_data_status_check' AND conrelid='aon_cms_diyform_data'::regclass) THEN ALTER TABLE aon_cms_diyform_data ADD CONSTRAINT aon_cms_diyform_data_status_check CHECK ((status = ANY (ARRAY[0, 1, 2]))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_diyform_data_form_idx ON aon_cms_diyform_data USING btree (form_id, created_at DESC);
CREATE INDEX IF NOT EXISTS aon_cms_diyform_data_status_idx ON aon_cms_diyform_data USING btree (status);

CREATE TABLE IF NOT EXISTS aon_cms_order (
  id varchar(20) NOT NULL,
  order_no varchar(32) NOT NULL,
  contact_name varchar(80) NOT NULL,
  contact_phone varchar(30) NOT NULL,
  item_name varchar(160) NOT NULL,
  quantity integer DEFAULT 1 NOT NULL,
  amount numeric(12,2) DEFAULT 0 NOT NULL,
  status smallint DEFAULT 0 NOT NULL,
  payment_status smallint DEFAULT 0 NOT NULL,
  remark varchar(500) DEFAULT '' NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  article_id varchar(20) NOT NULL,
  user_id varchar(20),
  shipping_address varchar(500) NOT NULL,
  shipping_status smallint DEFAULT 0 NOT NULL,
  express_company varchar(60) DEFAULT '' NOT NULL,
  express_no varchar(60) DEFAULT '' NOT NULL,
  shipped_at timestamptz,
  received_at timestamptz,
  paid_amount numeric(12,2) DEFAULT 0 NOT NULL,
  payment_method varchar(30) DEFAULT '' NOT NULL,
  payment_no varchar(80) DEFAULT '' NOT NULL,
  paid_at timestamptz,
  completed_at timestamptz,
  closed_at timestamptz,
  last_follow_at timestamptz,
  next_follow_at timestamptz,
  admin_remark varchar(1000) DEFAULT '' NOT NULL,
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_order_order_no_key' AND conrelid='aon_cms_order'::regclass) THEN ALTER TABLE aon_cms_order ADD CONSTRAINT aon_cms_order_order_no_key UNIQUE (order_no); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_order_shipping_status_check' AND conrelid='aon_cms_order'::regclass) THEN ALTER TABLE aon_cms_order ADD CONSTRAINT aon_cms_order_shipping_status_check CHECK ((shipping_status = ANY (ARRAY[0, 1, 2]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_order_paid_amount_check' AND conrelid='aon_cms_order'::regclass) THEN ALTER TABLE aon_cms_order ADD CONSTRAINT aon_cms_order_paid_amount_check CHECK ((paid_amount >= (0)::numeric)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_order_quantity_check' AND conrelid='aon_cms_order'::regclass) THEN ALTER TABLE aon_cms_order ADD CONSTRAINT aon_cms_order_quantity_check CHECK ((quantity > 0)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_order_amount_check' AND conrelid='aon_cms_order'::regclass) THEN ALTER TABLE aon_cms_order ADD CONSTRAINT aon_cms_order_amount_check CHECK ((amount >= (0)::numeric)); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_order_status_check' AND conrelid='aon_cms_order'::regclass) THEN ALTER TABLE aon_cms_order ADD CONSTRAINT aon_cms_order_status_check CHECK ((status = ANY (ARRAY[0, 1, 2, 3]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_order_payment_status_check' AND conrelid='aon_cms_order'::regclass) THEN ALTER TABLE aon_cms_order ADD CONSTRAINT aon_cms_order_payment_status_check CHECK ((payment_status = ANY (ARRAY[0, 1, 2]))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_order_phone_idx ON aon_cms_order USING btree (contact_phone);
CREATE INDEX IF NOT EXISTS aon_cms_order_status_idx ON aon_cms_order USING btree (status, payment_status);
CREATE INDEX IF NOT EXISTS aon_cms_order_created_idx ON aon_cms_order USING btree (created_at);
CREATE INDEX IF NOT EXISTS aon_cms_order_article_idx ON aon_cms_order USING btree (article_id);
CREATE INDEX IF NOT EXISTS aon_cms_order_user_idx ON aon_cms_order USING btree (user_id) WHERE (user_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS aon_cms_order_shipping_idx ON aon_cms_order USING btree (shipping_status);

CREATE TABLE IF NOT EXISTS aon_cms_order_log (
  id varchar(20) NOT NULL,
  order_id varchar(20) NOT NULL,
  action varchar(20) DEFAULT 'follow' NOT NULL,
  content varchar(1000) DEFAULT '' NOT NULL,
  next_follow_at timestamptz,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS aon_cms_order_log_order_idx ON aon_cms_order_log USING btree (order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS aon_cms_page (
  id varchar(20) NOT NULL,
  title varchar(200) DEFAULT '' NOT NULL,
  slug varchar(120) DEFAULT '' NOT NULL,
  summary varchar(1000) DEFAULT '' NOT NULL,
  html_content text DEFAULT '' NOT NULL,
  cover_url varchar(1000) DEFAULT '' NOT NULL,
  seo_title varchar(200) DEFAULT '' NOT NULL,
  seo_keywords varchar(200) DEFAULT '' NOT NULL,
  seo_description varchar(500) DEFAULT '' NOT NULL,
  status smallint DEFAULT 0 NOT NULL,
  publish_at timestamptz,
  order_num smallint DEFAULT 0 NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  kind smallint DEFAULT 1 NOT NULL,
  link varchar(1000) DEFAULT '' NOT NULL,
  target smallint DEFAULT 0 NOT NULL,
  category_id varchar(20),
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_page_slug_unique' AND conrelid='aon_cms_page'::regclass) THEN ALTER TABLE aon_cms_page ADD CONSTRAINT aon_cms_page_slug_unique UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_page_cms_check_1' AND conrelid='aon_cms_page'::regclass) THEN ALTER TABLE aon_cms_page ADD CONSTRAINT aon_cms_page_cms_check_1 CHECK ((status = ANY (ARRAY[0, 1, 2, 3, 4]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_page_cms_check_2' AND conrelid='aon_cms_page'::regclass) THEN ALTER TABLE aon_cms_page ADD CONSTRAINT aon_cms_page_cms_check_2 CHECK (((status <> 2) OR (publish_at IS NOT NULL))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_page_publish_idx ON aon_cms_page USING btree (status, publish_at);
CREATE INDEX IF NOT EXISTS aon_cms_page_created_idx ON aon_cms_page USING btree (created_at);
CREATE INDEX IF NOT EXISTS aon_cms_page_category_idx ON aon_cms_page USING btree (category_id);

CREATE TABLE IF NOT EXISTS aon_cms_review_log (
  id varchar(20) NOT NULL,
  content_id varchar(20) NOT NULL,
  content_type varchar(20) NOT NULL,
  from_status smallint NOT NULL,
  to_status smallint NOT NULL,
  action varchar(20) NOT NULL,
  reason varchar(1000) DEFAULT '' NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  snapshot text,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS aon_cms_tag (
  id varchar(20) NOT NULL,
  title varchar(100) DEFAULT '' NOT NULL,
  slug varchar(120) DEFAULT '' NOT NULL,
  status smallint DEFAULT 1 NOT NULL,
  order_num smallint DEFAULT 0 NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  is_hot boolean DEFAULT false NOT NULL,
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_tag_slug_unique' AND conrelid='aon_cms_tag'::regclass) THEN ALTER TABLE aon_cms_tag ADD CONSTRAINT aon_cms_tag_slug_unique UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_tag_cms_check_1' AND conrelid='aon_cms_tag'::regclass) THEN ALTER TABLE aon_cms_tag ADD CONSTRAINT aon_cms_tag_cms_check_1 CHECK ((status = ANY (ARRAY[0, 1]))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_tag_created_idx ON aon_cms_tag USING btree (created_at);

CREATE TABLE IF NOT EXISTS aon_cms_topic (
  id varchar(20) NOT NULL,
  title varchar(200) DEFAULT '' NOT NULL,
  slug varchar(120) DEFAULT '' NOT NULL,
  summary varchar(1000) DEFAULT '' NOT NULL,
  html_content text DEFAULT '' NOT NULL,
  cover_url varchar(1000) DEFAULT '' NOT NULL,
  status smallint DEFAULT 1 NOT NULL,
  order_num smallint DEFAULT 0 NOT NULL,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  type smallint DEFAULT 1 NOT NULL,
  target varchar(200) DEFAULT '' NOT NULL,
  target_blank smallint DEFAULT 0 NOT NULL,
  PRIMARY KEY (id)
);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_topic_slug_unique' AND conrelid='aon_cms_topic'::regclass) THEN ALTER TABLE aon_cms_topic ADD CONSTRAINT aon_cms_topic_slug_unique UNIQUE (slug); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_topic_cms_check_1' AND conrelid='aon_cms_topic'::regclass) THEN ALTER TABLE aon_cms_topic ADD CONSTRAINT aon_cms_topic_cms_check_1 CHECK ((status = ANY (ARRAY[0, 1]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_topic_type_check' AND conrelid='aon_cms_topic'::regclass) THEN ALTER TABLE aon_cms_topic ADD CONSTRAINT aon_cms_topic_type_check CHECK ((type = ANY (ARRAY[1, 2, 3, 4, 5, 6]))); END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='aon_cms_topic_target_blank_check' AND conrelid='aon_cms_topic'::regclass) THEN ALTER TABLE aon_cms_topic ADD CONSTRAINT aon_cms_topic_target_blank_check CHECK ((target_blank = ANY (ARRAY[0, 1]))); END IF; END $$;
CREATE INDEX IF NOT EXISTS aon_cms_topic_created_idx ON aon_cms_topic USING btree (created_at);


LOCK TABLE system_menu IN SHARE ROW EXCLUSIVE MODE;
DO $$
DECLARE base bigint; existing integer;
BEGIN
  SELECT count(*) INTO existing FROM system_menu WHERE rule IN ('addons_cms','aon_cms_category','aon_cms_category_list','aon_cms_category_info','aon_cms_category_add','aon_cms_category_edit','aon_cms_category_del','aon_cms_tag','aon_cms_tag_list','aon_cms_tag_info','aon_cms_tag_add','aon_cms_tag_edit','aon_cms_tag_del','aon_cms_topic','aon_cms_topic_list','aon_cms_topic_info','aon_cms_topic_add','aon_cms_topic_edit','aon_cms_topic_del','aon_cms_article','aon_cms_article_list','aon_cms_article_info','aon_cms_article_add','aon_cms_article_edit','aon_cms_article_del','aon_cms_article_review','aon_cms_page','aon_cms_page_list','aon_cms_page_info','aon_cms_page_add','aon_cms_page_edit','aon_cms_page_del','aon_cms_page_review','aon_cms_block','aon_cms_block_list','aon_cms_block_info','aon_cms_block_add','aon_cms_block_edit','aon_cms_block_del','aon_cms_comment','aon_cms_comment_list','aon_cms_comment_info','aon_cms_comment_add','aon_cms_comment_edit','aon_cms_comment_del','aon_cms_comment_review','aon_cms_statistics','aon_cms_statistics_list','aon_cms_order','aon_cms_order_list','aon_cms_order_info','aon_cms_order_edit','aon_cms_order_pay','aon_cms_order_ship','aon_cms_order_follow','aon_cms_order_complete','aon_cms_order_close','aon_cms_order_del');
  IF existing = 58 THEN RETURN; END IF;
  IF existing <> 0 THEN RAISE EXCEPTION 'CMS 菜单不完整，请人工检查后重试'; END IF;
  SELECT COALESCE(max("right"), 0) INTO base FROM system_menu;
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000000','CMS',1,1,'addons_cms',50,'/addons/cms',0,'',0,0,'',0,1,1,NULL,base+1,base+128,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000001','栏目',2,1,'aon_cms_category',90,'/addons/cms/category',0,'addons/cms/views/category/index',0,0,'',0,0,1,'820260920000000000',base+2,base+13,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000002','列表',3,1,'aon_cms_category_list',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+3,base+4,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000003','详情',3,1,'aon_cms_category_info',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+5,base+6,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000004','新增',3,1,'aon_cms_category_add',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+7,base+8,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000005','编辑',3,1,'aon_cms_category_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+9,base+10,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000006','删除',3,1,'aon_cms_category_del',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+11,base+12,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000007','标签',2,1,'aon_cms_tag',80,'/addons/cms/tag',0,'addons/cms/views/tag/index',0,0,'',0,0,1,'820260920000000000',base+14,base+25,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000008','列表',3,1,'aon_cms_tag_list',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+15,base+16,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000009','详情',3,1,'aon_cms_tag_info',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+17,base+18,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000010','新增',3,1,'aon_cms_tag_add',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+19,base+20,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000011','编辑',3,1,'aon_cms_tag_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+21,base+22,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000012','删除',3,1,'aon_cms_tag_del',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+23,base+24,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000013','专题',2,1,'aon_cms_topic',70,'/addons/cms/topic',0,'addons/cms/views/topic/index',0,0,'',0,0,1,'820260920000000000',base+26,base+37,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000014','列表',3,1,'aon_cms_topic_list',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+27,base+28,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000015','详情',3,1,'aon_cms_topic_info',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+29,base+30,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000016','新增',3,1,'aon_cms_topic_add',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+31,base+32,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000017','编辑',3,1,'aon_cms_topic_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+33,base+34,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000018','删除',3,1,'aon_cms_topic_del',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+35,base+36,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000019','文章',2,1,'aon_cms_article',60,'/addons/cms/article',0,'addons/cms/views/article/index',0,0,'',0,0,1,'820260920000000000',base+38,base+51,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000020','列表',3,1,'aon_cms_article_list',50,'',0,'',0,0,'',0,0,1,'820260920000000019',base+39,base+40,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000021','详情',3,1,'aon_cms_article_info',50,'',0,'',0,0,'',0,0,1,'820260920000000019',base+41,base+42,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000022','新增',3,1,'aon_cms_article_add',50,'',0,'',0,0,'',0,0,1,'820260920000000019',base+43,base+44,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000023','编辑',3,1,'aon_cms_article_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000019',base+45,base+46,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000024','删除',3,1,'aon_cms_article_del',50,'',0,'',0,0,'',0,0,1,'820260920000000019',base+47,base+48,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000025','审核',3,1,'aon_cms_article_review',50,'',0,'',0,0,'',0,0,1,'820260920000000019',base+49,base+50,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000026','单页',2,1,'aon_cms_page',50,'/addons/cms/page',0,'addons/cms/views/page/index',0,0,'',0,0,1,'820260920000000000',base+52,base+65,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000027','列表',3,1,'aon_cms_page_list',50,'',0,'',0,0,'',0,0,1,'820260920000000026',base+53,base+54,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000028','详情',3,1,'aon_cms_page_info',50,'',0,'',0,0,'',0,0,1,'820260920000000026',base+55,base+56,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000029','新增',3,1,'aon_cms_page_add',50,'',0,'',0,0,'',0,0,1,'820260920000000026',base+57,base+58,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000030','编辑',3,1,'aon_cms_page_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000026',base+59,base+60,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000031','删除',3,1,'aon_cms_page_del',50,'',0,'',0,0,'',0,0,1,'820260920000000026',base+61,base+62,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000032','审核',3,1,'aon_cms_page_review',50,'',0,'',0,0,'',0,0,1,'820260920000000026',base+63,base+64,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000033','区块',2,1,'aon_cms_block',40,'/addons/cms/block',0,'addons/cms/views/block/index',0,0,'',0,0,1,'820260920000000000',base+66,base+77,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000034','列表',3,1,'aon_cms_block_list',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+67,base+68,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000035','详情',3,1,'aon_cms_block_info',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+69,base+70,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000036','新增',3,1,'aon_cms_block_add',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+71,base+72,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000037','编辑',3,1,'aon_cms_block_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+73,base+74,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000038','删除',3,1,'aon_cms_block_del',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+75,base+76,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000039','评论',2,1,'aon_cms_comment',30,'/addons/cms/comment',0,'addons/cms/views/comment/index',0,0,'',0,0,1,'820260920000000000',base+78,base+91,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000040','列表',3,1,'aon_cms_comment_list',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+79,base+80,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000041','详情',3,1,'aon_cms_comment_info',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+81,base+82,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000042','新增',3,1,'aon_cms_comment_add',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+83,base+84,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000043','编辑',3,1,'aon_cms_comment_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+85,base+86,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000044','删除',3,1,'aon_cms_comment_del',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+87,base+88,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000045','审核',3,1,'aon_cms_comment_review',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+89,base+90,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000046','统计',2,1,'aon_cms_statistics',100,'/addons/cms/statistics',0,'addons/cms/views/statistics/index',0,0,'',0,0,1,'820260920000000000',base+92,base+95,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000047','列表',3,1,'aon_cms_statistics_list',50,'',0,'',0,0,'',0,0,1,'820260920000000046',base+93,base+94,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000054','订单',2,1,'aon_cms_order',20,'/addons/cms/order',0,'addons/cms/views/order/index',0,0,'',0,0,1,'820260920000000000',base+108,base+127,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000055','列表',3,1,'aon_cms_order_list',50,'',0,'',0,0,'',0,0,1,'820260920000000054',base+109,base+110,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000056','详情',3,1,'aon_cms_order_info',50,'',0,'',0,0,'',0,0,1,'820260920000000054',base+111,base+112,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000057','编辑',3,1,'aon_cms_order_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000054',base+113,base+114,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000058','收款',3,1,'aon_cms_order_pay',50,'',0,'',0,0,'',0,0,1,'820260920000000054',base+115,base+116,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000059','发货',3,1,'aon_cms_order_ship',50,'',0,'',0,0,'',0,0,1,'820260920000000054',base+117,base+118,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000060','跟进',3,1,'aon_cms_order_follow',50,'',0,'',0,0,'',0,0,1,'820260920000000054',base+119,base+120,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000061','完成',3,1,'aon_cms_order_complete',50,'',0,'',0,0,'',0,0,1,'820260920000000054',base+121,base+122,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000062','关闭',3,1,'aon_cms_order_close',50,'',0,'',0,0,'',0,0,1,'820260920000000054',base+123,base+124,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000063','删除',3,1,'aon_cms_order_del',50,'',0,'',0,0,'',0,0,1,'820260920000000054',base+125,base+126,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
END $$;

-- 自定义表单（表单管理 + 表单数据）后台菜单：嵌套集追加到 CMS 父节点末尾
LOCK TABLE system_menu IN SHARE ROW EXCLUSIVE MODE;
DO $$
DECLARE cms_right bigint;
DECLARE span integer := 36;
BEGIN
  IF EXISTS (SELECT 1 FROM system_menu WHERE rule = 'aon_cms_diyform') THEN
    RETURN;
  END IF;
  SELECT "right" INTO cms_right FROM system_menu WHERE id = '820260920000000000';
  UPDATE system_menu SET "right" = "right" + span WHERE "right" >= cms_right;
  UPDATE system_menu SET "left" = "left" + span WHERE "left" > cms_right;
  INSERT INTO system_menu(id, title, menu_type, status, rule, order_num, path, is_link, component, hide_menu, cache, icon, affix, always_show, breadcrumb, parent_id, "left", "right", lock_version, created_at, updated_at)
  VALUES
    ('820260920000000064', '自定义表单', 2, 1, 'aon_cms_diyform', 40, '/addons/cms/diyform', 0, 'addons/cms/views/diyform/index', 0, 0, '', 0, 0, 1, '820260920000000000', cms_right, cms_right + 17, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000065', '列表', 3, 1, 'aon_cms_diyform_list', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000064', cms_right + 1, cms_right + 2, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000066', '详情', 3, 1, 'aon_cms_diyform_info', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000064', cms_right + 3, cms_right + 4, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000067', '新增', 3, 1, 'aon_cms_diyform_add', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000064', cms_right + 5, cms_right + 6, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000068', '编辑', 3, 1, 'aon_cms_diyform_edit', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000064', cms_right + 7, cms_right + 8, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000069', '删除', 3, 1, 'aon_cms_diyform_del', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000064', cms_right + 9, cms_right + 10, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000070', '数据', 2, 1, 'aon_cms_diyform_data', 46, '/addons/cms/diyform-data', 0, 'addons/cms/views/diyform/data', 1, 0, '', 0, 1, 1, '820260920000000000', cms_right + 18, cms_right + 35, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000071', '列表', 3, 1, 'aon_cms_diyform_data_list', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000070', cms_right + 19, cms_right + 20, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000072', '详情', 3, 1, 'aon_cms_diyform_data_info', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000070', cms_right + 21, cms_right + 22, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000073', '编辑', 3, 1, 'aon_cms_diyform_data_edit', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000070', cms_right + 23, cms_right + 24, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000074', '审核', 3, 1, 'aon_cms_diyform_data_review', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000070', cms_right + 25, cms_right + 26, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000075', '回复', 3, 1, 'aon_cms_diyform_data_reply', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000070', cms_right + 27, cms_right + 28, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000076', '导出', 3, 1, 'aon_cms_diyform_data_export', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000070', cms_right + 29, cms_right + 30, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('820260920000000077', '删除', 3, 1, 'aon_cms_diyform_data_del', 50, '', 0, '', 0, 0, '', 0, 0, 1, '820260920000000070', cms_right + 31, cms_right + 32, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
END $$;

-- ===== 演示数据（幂等，ON CONFLICT DO NOTHING，不覆盖已有数据）=====
-- 栏目
INSERT INTO aon_cms_category ("id", "title", "slug", "status", "order_num", "type", "link_url", "target", "is_nav", "is_recommend", "cover_url", "parent_id", "left", "right", "lock_version", "created_admin_id", "updated_admin_id", "created_at", "updated_at")
VALUES
  ('90000000000000000000', '产品动态', 'product', 1, 0, 2, '', '', TRUE, TRUE, '/index/images/cms/cms-ai-editorial.png', NULL, '1', '8', '', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.237Z'),
  ('90000000000000000001', '版本发布', 'release', 1, 0, 1, '', '', TRUE, FALSE, '/index/images/cms/cms-design-system.png', '90000000000000000000', '2', '3', '', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.255Z'),
  ('90000000000000000002', '使用教程', 'tutorial', 1, 0, 1, '', '', TRUE, FALSE, '/index/images/cms/cms-cloud-analytics.png', '90000000000000000000', '4', '5', '', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.270Z'),
  ('90000000000000000003', '客户案例', 'case', 1, 0, 1, '', '', TRUE, FALSE, '/index/images/cms/cms-ai-editorial.png', '90000000000000000000', '6', '7', '', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.284Z'),
  ('90000000000000000004', '帮助中心', 'help', 1, 0, 2, '', '', TRUE, TRUE, '/index/images/cms/cms-cloud-analytics.png', NULL, '9', '14', '', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.299Z'),
  ('90000000000000000005', '常见问题', 'faq', 1, 0, 1, '', '', TRUE, FALSE, '/index/images/cms/cms-design-system.png', '90000000000000000004', '10', '11', '', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.313Z'),
  ('90000000000000000006', '故障排查', 'troubleshoot', 1, 0, 1, '', '', TRUE, FALSE, '/index/images/cms/cms-ai-editorial.png', '90000000000000000004', '12', '13', '', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.327Z'),
  ('90000000000000000007', '解决方案', 'solution', 1, 0, 2, '', '', TRUE, FALSE, '/index/images/cms/cms-cloud-analytics.png', NULL, '15', '18', '', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.341Z'),
  ('90000000000000000008', '行业方案', 'industry', 1, 0, 1, '', '', TRUE, FALSE, '/index/images/cms/cms-design-system.png', '90000000000000000007', '16', '17', '', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.356Z'),
  ('90000000000000000109', '开发素材', 'dev-resources', 1, 0, 1, '', '', TRUE, FALSE, '/index/images/cms/cms-ai-editorial.png', NULL, NULL, NULL, '', 'seed', 'seed', '2026-09-29T12:19:47.802Z', '2026-10-01T03:44:07.371Z'),
  ('90000000000000000201', '下载中心', 'download-center', 1, -10, 6, '', '', TRUE, FALSE, '', NULL, NULL, NULL, '', NULL, NULL, '2026-10-08T10:27:19.088Z', '2026-10-08T10:27:19.088Z'),
  ('90000000000000000202', '留言板', 'message-board', 1, -20, 4, '', '83000000000000000001', TRUE, FALSE, '', NULL, NULL, NULL, '', NULL, NULL, '2026-10-08T10:27:19.088Z', '2026-10-08T10:27:19.088Z'),
  ('90000000000000000203', '关于我们', 'about-us', 1, -30, 5, '', '90000000000000000036', TRUE, FALSE, '', NULL, NULL, NULL, '', NULL, NULL, '2026-10-08T10:27:19.088Z', '2026-10-08T10:27:19.088Z')
ON CONFLICT ("id") DO NOTHING;

-- 标签
INSERT INTO aon_cms_tag ("id", "title", "slug", "status", "order_num", "is_hot", "created_admin_id", "updated_admin_id", "created_at", "updated_at")
VALUES
  ('90000000000000000009', 'AI', 'ai', 1, 0, TRUE, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000010', '云原生', 'cloud', 1, 0, TRUE, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000011', '低代码', 'lowcode', 1, 0, FALSE, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000012', '权限', 'auth', 1, 0, TRUE, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000013', '可视化', 'viz', 1, 0, FALSE, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000014', '性能', 'perf', 1, 0, FALSE, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000015', '模板', 'tpl', 1, 0, FALSE, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000016', '安全', 'sec', 1, 0, TRUE, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z')
ON CONFLICT ("id") DO NOTHING;

-- 专题
INSERT INTO aon_cms_topic ("id", "title", "slug", "summary", "html_content", "cover_url", "status", "order_num", "type", "target", "target_blank", "created_admin_id", "updated_admin_id", "created_at", "updated_at")
VALUES
  ('90000000000000000017', '从零搭建后台', 'zero-to-admin', '面向新手的一套后台搭建专题。', '# 从零搭建后台

本专题汇总后台搭建的常见路径与避坑指南。', '/index/images/cms/cms-ai-editorial.png', 1, 0, 1, '', 0, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.386Z'),
  ('90000000000000000018', '性能优化实战', 'perf-in-action', '围绕真实业务场景的性能优化。', '# 性能优化实战

从数据库、缓存到前端的全链路优化。', '/index/images/cms/cms-cloud-analytics.png', 1, 1, 1, '', 0, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.400Z'),
  ('90000000000000000019', '插件生态', 'addons', 'meadmin 插件机制与扩展方式。', '# 插件生态

介绍插件目录结构、生命周期与发布。', '/index/images/cms/cms-design-system.png', 1, 2, 1, '', 0, '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.415Z')
ON CONFLICT ("id") DO NOTHING;

-- 单页
INSERT INTO aon_cms_page ("id", "title", "slug", "summary", "html_content", "cover_url", "seo_title", "seo_keywords", "seo_description", "status", "publish_at", "order_num", "kind", "link", "target", "category_id", "created_admin_id", "updated_admin_id", "created_at", "updated_at")
VALUES
  ('90000000000000000036', '关于我们', 'about', '关于 meadmin 团队与理念。', '# 关于我们

meadmin 是一站式全栈后台方案。', '/index/images/cms/cms-design-system.png', '关于我们', '', '关于 meadmin 团队与理念。', 2, '2026-07-31T02:00:00.000Z', 0, 1, '', 0, '90000000000000000203', '657558079876890624', '657558079876890624', '2026-07-31T02:00:00.000Z', '2026-10-01T03:44:07.429Z'),
  ('90000000000000000037', '服务协议', 'tos', '服务协议草稿。', '# 服务协议

草稿。', '', '服务协议（草稿）', '', '服务协议草稿。', 0, '2026-09-29T15:17:28.992Z', 0, 1, '', 0, NULL, '657558079876890624', '604612615536115712', '2026-07-31T02:00:00.000Z', '2026-10-06T14:05:28.400Z'),
  ('90000000000000000038', '隐私政策', 'privacy', '隐私政策说明。', '# 隐私政策

说明。', '/index/images/cms/cms-cloud-analytics.png', '隐私政策', '', '隐私政策说明。', 1, NULL, 0, 1, '', 0, NULL, '657558079876890624', '604612615536115712', '2026-07-31T02:00:00.000Z', '2026-10-01T03:44:07.443Z')
ON CONFLICT ("id") DO NOTHING;

-- 自定义表单
INSERT INTO aon_cms_diyform ("id", "title", "diyname", "description", "fields", "submit_text", "need_review", "is_message_board", "status", "order_num", "category_id", "created_admin_id", "updated_admin_id", "created_at", "updated_at")
VALUES
  ('83000000000000000001', '留言板', 'message', '前台留言板表单，提交后经审核公开展示。', '[{"name":"author","label":"称呼","type":"text","required":true,"placeholder":"怎么称呼你","maxlength":80},{"name":"contact","label":"联系方式","type":"text","required":false,"placeholder":"手机号或邮箱，仅管理员可见","maxlength":160},{"name":"content","label":"留言内容","type":"textarea","required":true,"placeholder":"请输入具体问题或建议","maxlength":2000}]', '提交留言', 1, TRUE, 1, 100, '90000000000000000202', NULL, NULL, '2026-10-01T03:47:27.099Z', '2026-10-01T03:47:27.099Z'),
  ('83000000000000000002', '友情链接', 'friendlink', '申请友情链接，审核通过后展示在首页。', '[{"name":"author","label":"网站名称","type":"text","required":true,"placeholder":"请输入网站名称","maxlength":80},{"name":"url","label":"网站地址","type":"text","required":true,"placeholder":"https://","maxlength":200},{"name":"contact","label":"联系方式","type":"text","required":false,"placeholder":"邮箱或QQ，仅管理员可见","maxlength":160},{"name":"content","label":"网站简介","type":"textarea","required":false,"placeholder":"简单介绍你的网站","maxlength":500}]', '提交申请', 1, FALSE, 0, 50, NULL, NULL, NULL, '2026-10-01T03:47:27.099Z', '2026-10-01T03:47:27.099Z'),
  ('83000000000000000003', '热门导航', 'hotnav', '热门导航收录申请。', '[{"name":"author","label":"导航名称","type":"text","required":true,"placeholder":"请输入导航名称","maxlength":80},{"name":"url","label":"导航地址","type":"text","required":true,"placeholder":"https://","maxlength":200},{"name":"content","label":"导航说明","type":"textarea","required":false,"placeholder":"一句话说明","maxlength":300}]', '提交导航', 1, FALSE, 0, 40, NULL, NULL, NULL, '2026-10-01T03:47:27.099Z', '2026-10-01T03:47:27.099Z')
ON CONFLICT ("id") DO NOTHING;

-- 区块
INSERT INTO aon_cms_block ("id", "title", "slug", "position", "kind", "html_content", "cover_url", "link", "status", "start_at", "end_at", "order_num", "config", "display_title", "created_admin_id", "updated_admin_id", "created_at", "updated_at")
VALUES
  ('90000000000000000039', '首页 Banner', 'home-banner', 'home-content', 1, '# 欢迎使用 meadmin

一站式全栈后台解决方案。', '/index/images/cms/cms-ai-editorial.png', '', 1, NULL, NULL, 0, '', '首页 Banner', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000040', '产品动态推荐', 'home-articles', 'home-content', 1, '', '/index/images/cms/cms-ai-editorial.png', '', 0, NULL, NULL, 0, '{"source":"article","categoryId":"90000000000000000001","limit":6,"layout":"card"}', '产品动态推荐', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-10-01T03:44:07.458Z'),
  ('90000000000000000041', '热门标签', 'home-tags', 'home-content', 1, '', '', '', 0, NULL, NULL, 0, '{"source":"tag","hotOnly":true,"limit":8}', '热门标签', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000042', '友情链接', 'home-links', 'home-content', 1, '', '', 'https://www.meadmin.cn', 0, NULL, NULL, 0, '', '友情链接', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000043', '下载中心入口', 'home-download', 'sidebar', 3, '', '/index/images/cms/cms-design-system.png', '/aon/cms/download', 1, NULL, NULL, 0, '{"source":"download","limit":4}', '下载中心入口', '657558079876890624', '657558079876890624', '2026-08-20T02:00:00.000Z', '2026-08-20T02:00:00.000Z'),
  ('90000000000000000101', 'meadmin 全新 1.4 版本发布', 'block-90000000000000000101', 'home-banner', 2, '', '/index/images/cms/cms-ai-editorial.png', '/aon/cms/category/release', 1, NULL, NULL, 40, '', 'meadmin 全新 1.4 版本发布', 'seed', 'seed', '2026-09-29T12:19:22.979Z', '2026-09-29T12:19:22.979Z'),
  ('90000000000000000102', '云端数据分析能力升级', '90000000000000000102', 'home-banner', 2, '', '/index/images/cms/cms-cloud-analytics.png', '/aon/cms/category/solution', 1, NULL, NULL, 30, '', '云端数据分析能力升级', 'seed', 'seed', '2026-09-29T12:19:47.802Z', '2026-09-29T12:19:47.802Z'),
  ('90000000000000000103', '设计系统规范正式发布', '90000000000000000103', 'home-banner', 2, '', '/index/images/cms/cms-design-system.png', '/aon/cms/category/tutorial', 1, NULL, NULL, 20, '', '设计系统规范正式发布', 'seed', 'seed', '2026-09-29T12:19:47.802Z', '2026-09-29T12:19:47.802Z'),
  ('90000000000000000104', '访问官方文档与社区', '90000000000000000104', 'home-banner', 2, '', '/index/images/cms/cms-ai-editorial.png', 'https://www.meadmin.cn', 1, NULL, NULL, 10, '', '访问官方文档与社区', 'seed', 'seed', '2026-09-29T12:19:47.802Z', '2026-09-29T12:19:47.802Z'),
  ('90000000000000000105', '关于 meadmin', '90000000000000000105', 'home-content', 1, '**meadmin** 是一套基于 Midway + Vue3 的全栈一站式后台解决方案，提供开箱即用的权限、内容、订单与统计能力。', '/index/images/cms/cms-cloud-analytics.png', '', 1, NULL, NULL, 10, '', '关于 meadmin', 'seed', 'seed', '2026-09-29T12:19:47.802Z', '2026-10-01T03:44:07.471Z'),
  ('90000000000000000106', '快速开始', '90000000000000000106', 'home-content', 1, '只需一条命令即可生成 CRUD 与菜单：`pnpm create meadminjs@latest`。详见使用教程栏目。', '/index/images/cms/cms-design-system.png', '/aon/cms/category/product', 1, NULL, NULL, 0, '', '快速开始', 'seed', 'seed', '2026-09-29T12:19:47.802Z', '2026-10-01T03:44:07.492Z'),
  ('90000000000000000107', '官方文档', '90000000000000000107', 'sidebar', 3, '', '/index/images/cms/cms-design-system.png', 'https://www.meadmin.cn', 1, NULL, NULL, 10, '', '官方文档', 'seed', 'seed', '2026-09-29T12:19:47.802Z', '2026-09-29T12:19:47.802Z'),
  ('90000000000000000108', '开源仓库', '90000000000000000108', 'sidebar', 3, '', '/index/images/cms/cms-cloud-analytics.png', 'https://github.com/yuntian001/meadmin', 1, NULL, NULL, 0, '', '开源仓库', 'seed', 'seed', '2026-09-29T12:19:47.802Z', '2026-09-29T12:19:47.802Z')
ON CONFLICT ("id") DO NOTHING;

-- 文章
INSERT INTO aon_cms_article ("id", "title", "slug", "summary", "html_content", "cover_url", "seo_title", "seo_keywords", "seo_description", "status", "publish_at", "order_num", "category_id", "topic_id", "tag_ids", "views", "likes", "comments", "order_enabled", "is_download", "file_url", "file_name", "downloads", "is_gallery", "created_admin_id", "updated_admin_id", "created_at", "updated_at")
VALUES
  ('90000000000000000035', '（未到发布时间）产品路线图预告', 'demo-future-01', '设置了未来发布时间的路线图预告，届时会自动转为可见。', '<p>这是一篇定时发布的内容。系统会按设定的发布时间自动放出来，在此之前前台不展示。</p>
<h2>下一个版本的重点方向</h2>
<ol><li><strong>表单引擎</strong>：让更多页面从手写代码转为配置产出。</li><li><strong>插件市场</strong>：补齐第三方插件的展示与安装入口。</li><li><strong>统计增强</strong>：在看板之外，提供可自助拖拽的报表配置。</li><li><strong>移动端体验</strong>：继续收敛窄屏下的表格与工具栏交互。</li></ol>
<h2>暂不在计划内</h2>
<ul><li>更换前端组件库；</li><li>引入运行时插件热加载；</li><li>放弃 monorepo 回到多仓库。</li></ul>
<h2>如何参与</h2>
<p>路线图是开放讨论的。如果你的诉求不在上面，欢迎在社区发帖说明场景与频次，我们会按实际反馈调整优先级。</p>
<blockquote><p>定时发布功能适合做版本预告、活动预热。内容编辑完成后把发布时间设到目标时刻即可，无需人工值守。</p></blockquote>', '/index/images/cms/cms-ai-editorial.png', '（未到发布时间）产品路线图预告', '', '设置了未来发布时间，前台暂不可见。', 1, '2026-10-02T02:00:00.000Z', 0, '90000000000000000001', NULL, ARRAY['90000000000000000009']::varchar[], 2016, 178, 11, FALSE, FALSE, '', '', 0, FALSE, '657558079876890624', '604612615536115712', '2026-09-28T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000032', '（待审核）插件市场接入方案', 'demo-pending-01', '等待管理员审核的插件市场方案，产品线走异步支付的接入路径与审核流程。', '<blockquote><p>本文正在等待管理员审核，审核通过后将正式对外可见。</p></blockquote>
<h2>背景</h2>
<p>社区里已经出现了若干第三方插件，缺少一个统一的展示与安装入口。本方案希望在不大改现有插件机制的前提下，补上层市场能力。</p>
<h2>总体思路</h2>
<p>插件仍然是 <code>addons/</code> 目录下的一个包，市场只是在外面加一层"目录"。安装流程保持手动可控，不引入运行时热插拔带来的不确定性。</p>
<h2>接入流程</h2>
<ol><li><strong>提交</strong>：开发者填写插件名称、简介、仓库地址、兼容版本区间；</li><li><strong>审核</strong>：管理员检查依赖安全性、是否存在文件系统越界操作；</li><li><strong>上架</strong>：审核通过后进入市场列表，支持按兼容版本筛选；</li><li><strong>安装</strong>：用户按文档手动安装，CLI 提供可选的拉取命令。</li></ol>
<h2>审核标准</h2>
<table><thead><tr><th>检查项</th><th>要求</th></tr></thead><tbody><tr><td>依赖来源</td><td>必须来自公开 registry，不接受私有或未声明的依赖</td></tr><tr><td>文件操作</td><td>不得跨出插件目录写入，禁止符号链接</td></tr><tr><td>网络行为</td><td>外部请求需在文档中明示</td></tr><tr><td>兼容声明</td><td>必须标注已验证的主版本号</td></tr></tbody></table>
<h2>待讨论</h2>
<ul><li>是否需要付费插件的支持；</li><li>版本失效后的下架机制；</li><li>评分与反馈如何收集。</li></ul>
<p><em>以上内容为提交版本，审核意见将直接体现为正文修订。</em></p>', '/index/images/cms/cms-design-system.png', '（待审核）插件市场接入方案', '', '等待管理员审核的插件市场方案。', 2, '2026-10-01T03:10:00.274Z', 0, '90000000000000000001', '90000000000000000019', ARRAY['90000000000000000011']::varchar[], 426, 28, 7, FALSE, FALSE, '', '', 0, FALSE, '657558079876890624', '604612615536115712', '2026-09-27T02:00:00.000Z', '2026-10-01T03:10:00.274Z'),
  ('90000000000000000120', 'meadmin 快速上手手册（PDF）', 'demo-res-01', '完整版上手手册：环境准备、初始化、目录结构、CRUD 生成与排错附录一应俱全。', '<p>这是面向新同事的离线版上手手册，比在线版更详细，额外附带一份报错对照附录。推荐作为入职第一天的阅读材料。</p><h2>这份素材包含什么</h2><ul><li>环境清单与版本校验命令，涵盖 Node、pnpm、PostgreSQL、Redis 四项</li><li>脚手架初始化的分步截图，包括交互式选项的含义</li><li>目录结构逐项说明，标注哪些目录需要你改、哪些不应改动</li><li>CRUD 生成命令的完整参数表与生成产物清单</li><li>报错对照附录：依赖安装失败、端口占用、数据库连接失败三类高频问题</li></ul><img src="/index/images/cms/cms-cloud-analytics.png" alt="资源预览" /><h2>建议用法</h2><ol><li>先按环境清单校验本机版本，不满足的先升级再继续</li><li>通读目录结构章节，在心里建立"后端在哪、前端在哪、插件在哪"的整体图景</li><li>照着初始化章节做一遍，得到一个能启动的工程</li><li>最后再执行 CRUD 生成，理解代码产出的位置</li></ol><h2>注意事项</h2><p>执行 CRUD 生成前请确认实体已经建好并且字段确定，生成后再改字段需要手工同步 DTO 与前端表单。</p><h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>PDF</td></tr><tr><td>篇幅</td><td>约 40 页</td></tr><tr><td>适用对象</td><td>初次接触项目的前端/后端同学</td></tr><tr><td>兼容版本</td><td>与当前主版本保持一致</td></tr></tbody></table>', '/index/images/cms/cms-cloud-analytics.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000015']::varchar[], 1963, 173, 11, FALSE, TRUE, '/files/meadmin-getting-started.csv', 'meadmin-getting-started.csv', 11, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-11T11:05:27.407Z'),
  ('90000000000000000121', '后台主题模板包', 'demo-res-02', '一套经过调校的后台主题模板，含配色变量、深浅双主题、组件样例页与图标集。', '<p>主题包解决的是"功能都能用，但界面不好看"的问题。它不触碰任何业务逻辑，只提供一套经过实际项目校验的样式变量与排版样例。</p><h2>这份素材包含什么</h2><ul><li>配色变量表：主色、功能色、中性灰阶，全部以 CSS 变量形式提供</li><li>深浅两套主题，可跟随系统偏好也可强制指定</li><li>组件样例页：表格、表单、抽屉、弹窗、标签页的排版参考</li><li>内置 SVG 图标集，按需加载，含在线替换面板</li><li>间距与圆角的基准值定义，保证跨页面一致</li></ul><img src="/index/images/cms/cms-design-system.png" alt="资源预览" /><h2>建议用法</h2><ol><li>解压后把样式目录放到前端项目的约定位置</li><li>在项目入口引入变量文件，覆盖默认 Token</li><li>打开样例页，确认组件间距与圆角符合预期</li><li>把主色替换成自家品牌色，其余色阶会自动联动</li></ol><h2>注意事项</h2><p>若你的项目自定义过组件内部样式，可能需要同步调整选择器权重，否则会出现部分样式被主题覆盖、部分保留的参差状态。</p><h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>ZIP 压缩包</td></tr><tr><td>包含</td><td>样式变量 + 样例页 + 图标</td></tr><tr><td>依赖</td><td>Element Plus</td></tr><tr><td>许可</td><td>MIT</td></tr></tbody></table>', '/index/images/cms/cms-design-system.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000015']::varchar[], 1910, 168, 8, FALSE, TRUE, '/files/meadmin-theme-pack.csv', 'meadmin-theme-pack.csv', 21, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:54:35.833Z'),
  ('90000000000000000122', '权限设计脑图', 'demo-res-03', '权限设计脑图源文件：三层权限、角色矩阵、数据范围与组织树结构一图理清。', '<p>脑图用于权限设计评审时统一口径。相比让与会者通读文档，一张图更适合跟业务方当场确认"谁能看什么"。</p><h2>这份素材包含什么</h2><ul><li>菜单权限：路由注册、侧边栏渲染、面包屑归属</li><li>按钮权限：权限码命名规范与前后端一致性校验</li><li>数据权限：五种数据范围取值与典型角色映射</li><li>组织模型：左右值树结构与修复树关系的触发时机</li><li>角色设计：多角色并存时的数据范围取值冲突处理</li></ul><img src="/index/images/cms/cms-ai-editorial.png" alt="资源预览" /><h2>建议用法</h2><ol><li>下载后用 XMind 或兼容软件打开</li><li>评审前先按第二层节点，把自家角色逐一填进去</li><li>填不进去或不知该填哪支的，就是还没想清楚的部分</li><li>把确认结果同步给后端，落到角色配置里</li></ol><h2>注意事项</h2><p>多角色并存时的数据范围取值最容易起争议，建议在第一次评审就把规则写死，不要留到开发阶段再补。</p><h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>XMind</td></tr><tr><td>层级</td><td>三层，共 30 余个节点</td></tr><tr><td>适用阶段</td><td>权限设计与评审</td></tr><tr><td>配套文档</td><td>教程《权限模型详解》</td></tr></tbody></table>', '/index/images/cms/cms-cloud-analytics.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000012']::varchar[], 1857, 163, 13, FALSE, TRUE, '/files/meadmin-auth-mindmap.csv', 'meadmin-auth-mindmap.csv', 32, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:54:35.705Z'),
  ('90000000000000000123', '组件库物料清单', 'demo-res-04', '组件库物料清单：把项目里实际用到的组件按类别清点一遍，附使用频次与替换建议。', '<p>这份清单回答两个问题：项目里到底用了哪些组件，以及哪些组件应该被优先替换或复用。适合作为重构前的摸底材料。</p><h2>这份素材包含什么</h2><ul><li>基础组件清单：按钮、输入框、下拉、日期选择等的使用位置与频次统计</li><li>高级组件清单：表格、虚拟滚动、树选择、上传等的实际调用点</li><li>自定义组件清单：项目内封装的业务组件及其职责说明</li><li>图标清单：内置图标集的分类与命名规范</li><li>替换建议：哪些第三方组件可以收敛，哪些需要保留</li></ul><img src="/index/images/cms/cms-design-system.png" alt="资源预览" /><h2>建议用法</h2><ol><li>先看基础组件部分，确认团队是否在同一件事上用了多种写法</li><li>再对照高级组件清单，找出重复封装的表格/表单逻辑</li><li>结合替换建议制定收敛计划，按调用频次从高到低推进</li></ol><h2>注意事项</h2><p>清单会随版本更新，若与实际代码有出入，请以代码为准，并把差异反馈到社区。</p><h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>PDF / Markdown</td></tr><tr><td>统计口径</td><td>按源码引用次数</td></tr><tr><td>适用阶段</td><td>重构摸底、新人熟悉</td></tr><tr><td>更新频率</td><td>跟随主版本</td></tr></tbody></table>', '/index/images/cms/cms-ai-editorial.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000011','90000000000000000015']::varchar[], 1804, 158, 10, FALSE, TRUE, '/files/component-inventory.csv', 'component-inventory.csv', 43, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:52:47.594Z'),
  ('90000000000000000124', '部署与运维手册', 'demo-res-05', '部署与运维手册：镜像构建、配置注入、健康检查、备份策略与回滚预案全覆盖。', '<p>上线只是开始，运维才是长期成本。这份手册把发布之后的日常动作写成可执行清单，重点是回滚预案与备份策略——这两项没有预案的项目，出事时只能现场想办法。</p><h2>这份素材包含什么</h2><ul><li>多阶段 Dockerfile 与精简运行时镜像的做法</li><li>ConfigMap / Secret 的配置项划分表</li><li>存活探针与就绪探针的推荐参数</li><li>优雅退出：SIGTERM 处理与未完成请求的收尾</li><li>数据库备份策略：全量与增量的搭配、保留周期</li><li>回滚预案：版本固定、镜像回退、数据兼容性检查顺序</li></ul><img src="/index/images/cms/cms-cloud-analytics.png" alt="资源预览" /><h2>建议用法</h2><ol><li>先在预发环境完整演练一遍发布流程，包括回滚</li><li>确认镜像固定到版本号而非 latest</li><li>把备份任务配置为独立调度，且验证过一次真实恢复</li><li>把回滚预案打印出来贴在值班文档里</li></ol><h2>注意事项</h2><p>备份没有验证过恢复流程的，等同于没有备份。至少每季度做一次真实的恢复演练。</p><h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>PDF</td></tr><tr><td>章节</td><td>构建 / 配置 / 监控 / 备份 / 回滚</td></tr><tr><td>适用对象</td><td>运维与实施人员</td></tr><tr><td>配套</td><td>教程《云原生部署实践》</td></tr></tbody></table>', '/index/images/cms/cms-cloud-analytics.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000010','90000000000000000014']::varchar[], 1751, 153, 9, FALSE, TRUE, '/files/deployment-operations.csv', 'deployment-operations.csv', 54, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:52:47.466Z'),
  ('90000000000000000125', 'API 接口文档合集', 'demo-res-06', 'API 接口文档合集：按模块分组的接口清单，含请求示例、错误码与权限要求。', '<p>接口文档按业务模块分组，每条接口都标注了所需权限、请求示例与错误码。前后端联调时先看这份，能省掉大半沟通成本。</p><h2>这份素材包含什么</h2><ul><li>认证与会话：登录、登出、刷新、验证码</li><li>权限相关：菜单、角色、组织、按钮权限码</li><li>配置相关：系统配置的读取与分组写入</li><li>内容相关：文章、栏目、标签、专题、评论、区块</li><li>订单相关：下单、支付登记、发货、完成</li><li>统一错误码表与常见排查建议</li></ul><img src="/index/images/cms/cms-ai-editorial.png" alt="资源预览" /><h2>建议用法</h2><ol><li>先在认证模块确认登录与鉴权方式</li><li>按你要对接的业务模块定位到具体分组</li><li>对照权限要求确认账号具备相应权限码</li><li>用请求示例做第一次联调，再逐步替换参数</li></ol><h2>注意事项</h2><p>所有接口遵循统一的响应包装格式，业务数据固定位于返回体中的数据字段，异常则通过状态码与消息字段表达。</p><h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>PDF / OpenAPI</td></tr><tr><td>分组</td><td>6 大模块</td></tr><tr><td>含错误码</td><td>是</td></tr><tr><td>含权限标注</td><td>是</td></tr></tbody></table>', '/index/images/cms/cms-design-system.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000009','90000000000000000010']::varchar[], 1698, 148, 10, FALSE, TRUE, '/files/api-reference.csv', 'api-reference.csv', 65, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:52:47.331Z'),
  ('90000000000000000126', '数据库迁移脚本包', 'demo-res-07', '数据库迁移脚本包：按版本排号的迁移文件与回滚脚本，含命名规范说明。', '<p>迁移脚本按版本号排号执行，每次结构变更都对应一个可回滚的脚本文件。包里同时给出命名规范，保证多人协作时不会撞号。</p><h2>这份素材包含什么</h2><ul><li>按发行版本组织的目录结构</li><li>每个变更的正向脚本与对应的回滚脚本</li><li>字段新增、改名、类型调整三类常见变更的模板</li><li>数据订正类脚本的编写规范与前置检查</li><li>执行顺序与幂等性的检查清单</li></ul><img src="/index/images/cms/cms-cloud-analytics.png" alt="资源预览" /><h2>建议用法</h2><ol><li>新变更按"版本目录 + 序号 + 动作"的规则命名，避免与他人的分支撞号</li><li>每个正向脚本必须同时提供回滚脚本</li><li>涉及数据订正的先跑一次只读检查，确认影响行数</li><li>生产执行前先在预发环境完整跑一遍</li></ol><h2>注意事项</h2><p>删除字段与修改字段类型属于高风险操作，必须先确认没有代码正在读取该字段，且回滚脚本能真正还原。</p><h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>SQL 脚本目录</td></tr><tr><td>组织方式</td><td>按版本号 + 序号</td></tr><tr><td>含回滚</td><td>是</td></tr><tr><td>适用对象</td><td>后端与运维</td></tr></tbody></table>', '/index/images/cms/cms-cloud-analytics.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000010','90000000000000000014']::varchar[], 1645, 143, 12, FALSE, TRUE, '/files/migration-package.csv', 'migration-package.csv', 76, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:54:35.260Z'),
  ('90000000000000000127', '代码示例：权限中间件', 'demo-res-08', '权限中间件代码示例：含注解式鉴权、数据范围注入与越权拦截的完整写法。', '<p>权限中间件的核心职责只有一个：<strong>在业务逻辑执行前把不合法的调用挡回去</strong>。这个示例演示了注解式鉴权与数据范围注入两件事的完整写法。</p>
<h2>示例包含什么</h2>
<ul><li>权限装饰器：声明接口所需的权限码，未命中直接返回无权限；</li><li>数据范围注入：读取角色的数据范围取值，拼接查询条件；</li><li>越权拦截：直接访问他人资源时的兜底判定；</li><li>单元测试样例：覆盖全部五种数据范围。</li></ul>
<h2>关键实现</h2>
<pre><code>// 1) 接口层声明所需权限
@Get(''/list'')
@AdminPermission([''aon_cms_article_list''])
async list() { ... }

// 2) 服务层按数据范围拼条件
if (scope === SCOPE_SELF) where.userId = ctx.adminId;
if (scope === SCOPE_ORG) where.orgId = ctx.orgId;
if (scope === SCOPE_ORG_CHILD) where.orgId = { [Op.in]: childOrgIds };
if (scope === SCOPE_CUSTOM) where.orgId = { [Op.in]: customOrgIds };</code></pre>
<p>注意范围条件必须并入 <code>where</code> 交给数据库执行，而不是取回全量再在内存里过滤。</p>
<h2>容易漏的一点</h2>
<p>接口层拦截了菜单与按钮权限，不代表数据就安全了。<strong>按主键直接查询的详情、编辑接口同样要带范围条件</strong>，否则改一下 id 就能看到别人的记录——这是中后台最常见的一类越权漏洞。</p>
<h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>形式</td><td>代码片段 + 说明</td></tr><tr><td>包含</td><td>权限装饰器 / 范围注入 / 测试</td></tr><tr><td>适用模块</td><td>任意需要鉴权的模块</td></tr><tr><td>依赖</td><td>框架内置权限助手</td></tr></tbody></table>
<blockquote><p>写完权限代码后，务必用两个不同组织的账号交叉验证一次：A 尝试访问 B 的数据，应当全部被拦截。</p></blockquote>', '/index/images/cms/cms-ai-editorial.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000012','90000000000000000016']::varchar[], 1592, 138, 4, FALSE, TRUE, '/files/permission-middleware.csv', 'permission-middleware.csv', 87, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:54:35.137Z'),
  ('90000000000000000128', '代码示例：导出中心', 'demo-res-09', '导出中心代码示例：含流式写出、大数据量分批与异步任务的两种导出方案。', '<p>导出功能看着简单，难点全在数据量上。这个示例给出两种方案：小数据量同步导出，大数据量走异步任务。</p>
<h2>方案一：同步导出（适合万级以内）</h2>
<p>按条件查询后直接写出文件流。关键是不要在内存里拼装完整文件，边查边写：</p>
<pre><code>// 分批取数，边取边写
let page = 1;
while (true) {
  const rows = await query({ limit: 1000, offset: (page - 1) * 1000 });
  if (!rows.length) break;
  await sheet.addRows(rows);
  page += 1;
}
return sheet.write(res);</code></pre>
<h2>方案二：异步任务（适合十万级以上）</h2>
<ol><li>提交导出请求时立即返回任务号；</li><li>后台任务分批取数并写入临时文件；</li><li>完成后写入对象存储或本地导出目录；</li><li>前端轮询任务状态，完成后给出下载链接。</li></ol>
<img src="/index/images/cms/cms-cloud-analytics.png" alt="导出任务流程" />
<h2>两个必做的细节</h2>
<ul><li><strong>限流</strong>：同一账号并发导出要限制，否则一次导出能把数据库连接池打满。</li><li><strong>清理</strong>：临时文件必须有过期清理任务，否则磁盘会被悄悄吃光。</li></ul>
<h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>形式</td><td>代码片段 + 流程说明</td></tr><tr><td>包含</td><td>同步 / 异步两种方案</td></tr><tr><td>建议阈值</td><td>万级以内同步，以上走异步</td></tr><tr><td>输出格式</td><td>Excel / CSV</td></tr></tbody></table>', '/index/images/cms/cms-cloud-analytics.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000014']::varchar[], 1539, 133, 11, FALSE, TRUE, '/files/export-center.csv', 'export-center.csv', 98, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:52:46.964Z'),
  ('90000000000000000129', '移动端适配指南', 'demo-res-10', '移动端适配指南：断点划分、表格变形策略与工具栏收纳的可落地清单。', '<p>后台做移动端适配，目标不是"把桌面版塞进小屏"，而是识别哪些场景真的会在手机上发生，然后把那几条路径做到可用。</p><h2>这份素材包含什么</h2><ul><li>断点划分建议：四个断点分别对应手机、竖屏平板、横屏平板、桌面</li><li>表格变形策略：横向滚动、固定列、卡片流三种方案的取舍</li><li>工具栏收纳：筛选项过多时如何收进抽屉</li><li>表单适配：单列布局与标签位置的调整规则</li><li>触控目标尺寸与可点击区域的最小建议值</li></ul><img src="/index/images/cms/cms-ai-editorial.png" alt="资源预览" /><h2>建议用法</h2><ol><li>先确认哪些角色真的会用手机访问，不要为所有人做适配</li><li>把高频场景的前三条路径拉出来单独优化</li><li>表格按列的重要性排序，次要列在小屏隐藏</li><li>真机验证，模拟器看不出触控热区的问题</li></ol><h2>注意事项</h2><p>把整张宽表格塞进横向滚动条通常是最差的选择。优先考虑卡片流：一行一条、左图右文，可读性提升明显。</p><h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>PDF</td></tr><tr><td>章节</td><td>断点 / 表格 / 表单 / 触控</td></tr><tr><td>适用对象</td><td>前端与设计</td></tr><tr><td>验证方式</td><td>建议真机</td></tr></tbody></table>', '/index/images/cms/cms-design-system.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000013','90000000000000000015']::varchar[], 1486, 128, 4, FALSE, TRUE, '/files/mobile_adaptation.txt', 'mobile_adaptation.txt', 19, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:54:34.897Z'),
  ('90000000000000000130', '可视化大屏模板', 'demo-res-11', '可视化大屏模板：含布局网格、卡片样式与三类典型图表的配置样例。', '<p>大屏模板提供的是"骨架"：一套已验证的布局网格与卡片样式，让你的数据往里填即可，不必从零调间距。</p>
<h2>包含内容</h2>
<ul><li><strong>布局网格</strong>：16 栅格基准，卡片按 4/8/12/16 四种宽度拼装；</li><li><strong>卡片样式</strong>：数字卡、趋势卡、排行卡、列表卡四类；</li><li><strong>图表样例</strong>：折线、柱状、环形三类典型配置，含暗色配色；</li><li><strong>自适应逻辑</strong>：容器尺寸变化时重算画布大小。</li></ul>
<img src="/index/images/cms/cms-design-system.png" alt="大屏模板预览" />
<h2>替换为自己数据的三步</h2>
<ol><li>把后端聚合接口换成你自己的地址；</li><li>调整 series 与 xAxis 的字段映射；</li><li>按实际数值位数重设单位与千分位格式。</li></ol>
<h2>常见失误</h2>
<p>图表容器没有显式高度是最常见的问题——初始化时拿到的高度是 0，结果画出来一片空白。给容器一个确定的高度或最小高度即可解决。</p>
<h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>形式</td><td>页面模板 + 配置样例</td></tr><tr><td>图表库</td><td>ECharts</td></tr><tr><td>含暗色主题</td><td>是</td></tr><tr><td>布局基准</td><td>16 栅格</td></tr></tbody></table>', '/index/images/cms/cms-cloud-analytics.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000013','90000000000000000015']::varchar[], 1433, 123, 13, FALSE, TRUE, '/files/dashboard-template.csv', 'dashboard-template.csv', 30, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:54:34.785Z'),
  ('90000000000000000131', '表单引擎配置样例', 'demo-res-12', '表单引擎配置样例：用一份 JSON 描述整张表单的结构、校验与联动规则。', '<p>这份样例展示如何用一份配置描述整张表单：字段结构、校验规则、显隐联动全部集中在配置里，页面只负责渲染。</p>
<h2>配置概览</h2>
<pre><code>{
  "fields": [
    { "name": "title", "label": "标题", "type": "input", "rules": ["required"] },
    { "name": "categoryId", "label": "栏目", "type": "select", "source": "category" },
    { "name": "remark", "label": "备注", "type": "textarea",
      "visible": { "field": "categoryId", "op": "notEmpty" } }
  ]
}</code></pre>
<h2>支持的字段类型</h2>
<table><thead><tr><th>类型</th><th>说明</th></tr></thead><tbody><tr><td>input</td><td>单行文本，支持长度校验</td></tr><tr><td>textarea</td><td>多行文本，可设行数</td></tr><tr><td>select</td><td>下拉选择，数据源可来自字典或接口</td></tr><tr><td>number</td><td>数值输入，支持区间限制</td></tr><tr><td>switch</td><td>开关，映射布尔值</td></tr></tbody></table>
<h2>使用建议</h2>
<ul><li>配置只描述结构，业务校验逻辑不要塞进配置；</li><li>联动规则保持简单，跨表单引用建议留在业务代码里做；</li><li>字段级权限复用现有按钮权限体系，不要另起一套。</li></ul>
<blockquote><p>表单引擎适合结构稳定的增删改查页面。业务逻辑复杂的表单还是手写更清晰，不要为了统一而统一。</p></blockquote>', '/index/images/cms/cms-ai-editorial.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000011']::varchar[], 1380, 118, 6, FALSE, TRUE, '/files/form-engine.csv', 'form-engine.csv', 41, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:54:34.661Z'),
  ('90000000000000000132', '插件开发脚手架', 'demo-res-13', '插件开发脚手架：目录约定、注册方式与打包发布的最小可用模板。', '<p>脚手架提供的是一个最小可用插件骨架，包含目录约定、注册入口与打包配置，照着填就能做出一个能被主程序识别的插件。</p>
<h2>脚手架结构</h2>
<pre><code>my-plugin/
  src/
    index.ts          # 插件入口：导出 register
    service/          # 业务服务
    controller/       # 接口
    dto/              # 参数校验
  template/           # 安装时同步到主工程的文件
  install.sql         # 结构初始化脚本
  package.json</code></pre>
<h2>开发顺序</h2>
<ol><li>在 <code>template/</code> 里按主工程目录结构放好要同步的文件；</li><li>实现服务与接口，权限码统一命名，避免与主程序冲突；</li><li>写好 install.sql，注意只做增量、避免覆盖已有数据；</li><li>本地联调通过后执行模板同步，打成分发包。</li></ol>
<img src="/index/images/cms/cms-cloud-analytics.png" alt="插件目录结构示意" />
<h2>三条硬约束</h2>
<ul><li><strong>文件不能越界</strong>：插件内的文件操作必须限制在自己的目录内，禁止符号链接。</li><li><strong>依赖必须显式声明</strong>：不接受未声明的依赖，也不从私有源拉取。</li><li><strong>兼容版本要标注</strong>：明确写出已验证过的主版本号。</li></ul>
<h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>形式</td><td>项目模板</td></tr><tr><td>包含</td><td>目录骨架 + 注册入口 + 打包配置</td></tr><tr><td>适用对象</td><td>插件开发者</td></tr><tr><td>前置知识</td><td>熟悉后端目录约定</td></tr></tbody></table>', '/index/images/cms/cms-cloud-analytics.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000011']::varchar[], 1327, 113, 7, FALSE, TRUE, '/files/plugin-scaffold.csv', 'plugin-scaffold.csv', 52, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:54:34.533Z'),
  ('90000000000000000133', '官方示例数据库', 'demo-res-14', '官方示例数据库：含组织架构、角色权限、内容数据在内的完整演示数据集。', '<p>示例数据库用于本地开发与功能演示，包含一套完整的组织架构、角色权限配置，以及足以撑起分页与各类状态流转的内容数据。</p><h2>这份素材包含什么</h2><ul><li>组织架构：多级组织树，可直接用来验证数据权限的四种范围</li><li>角色与权限：覆盖管理员、编辑、审核员、普通用户四类典型角色</li><li>内容数据：文章、栏目、标签、专题、区块的完整样例</li><li>互动数据：评论、点赞、举报、订单，用于验证各类状态流转</li><li>结构初始化脚本与数据导入脚本分离，可只导结构不导数据</li></ul><img src="/index/images/cms/cms-ai-editorial.png" alt="资源预览" /><h2>建议用法</h2><ol><li>先执行结构脚本，确认表与索引建立完成</li><li>再执行数据脚本，不要反序</li><li>在项目里执行菜单、组织、角色三处的「修复树关系」</li><li>用不同角色的账号登录，交叉验证数据权限是否生效</li></ol><h2>注意事项</h2><p>示例数据仅用于开发环境，请勿直接用于生产。若你的库里已有数据，请先备份再决定是否导入。</p><h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>SQL 脚本</td></tr><tr><td>包含</td><td>结构 + 数据</td></tr><tr><td>组织层级</td><td>多级</td></tr><tr><td>适用环境</td><td>本地开发 / 演示</td></tr></tbody></table>', '/index/images/cms/cms-design-system.png', '', '', '', 2, '2026-09-29T12:20:08.759Z', 0, '90000000000000000109', NULL, ARRAY['90000000000000000010','90000000000000000014']::varchar[], 1274, 108, 8, FALSE, TRUE, '/files/sample-database.csv', 'sample-database.csv', 63, FALSE, 'seed', '604612615536115712', '2026-09-29T12:20:08.759Z', '2026-10-10T14:54:34.413Z'),
  ('90000000000000000101', '图集精选：数据可视化大屏', 'demo-gallery-03', '数据可视化大屏截图集，覆盖运营看板、实时监控与月度分析三类大屏。', '<p>这是一组数据可视化大屏的界面截图。图集里每一张都来自实际页面，配文说明设计意图与可复用的做法，方便你直接搬到自己的项目里。</p>
<h2>图集一览</h2>
<h3>运营看板大屏</h3><img src="/index/images/cms/cms-cloud-analytics.png" alt="运营看板大屏" /><p>深底 + 高饱和强调色，核心数字使用大字号等宽字体，保证远距离可读。</p>
<h3>实时监控大屏</h3><img src="/index/images/cms/cms-design-system.png" alt="实时监控大屏" /><p>中部放地理/拓扑主图，两侧对称排布告警列表与关键指标，视线路径集中在中央。</p>
<h3>月度分析大屏</h3><img src="/index/images/cms/cms-ai-editorial.png" alt="月度分析大屏" /><p>以对比类图表为主，同比环比直接标注在数值旁，避免读者心算。</p>
<h2>可以复用的三点</h2>
<ul><li><strong>留白优先</strong>：先确定卡片之间的间距与容器内边距，再去调组件自身的边距，整体会干净很多。</li><li><strong>层级靠背景</strong>：不要用多层边框做区分，改用背景色与阴影拉开层级。</li><li><strong>操作要显眼</strong>：主操作唯一且位置固定，次级操作用弱化样式或收进下拉。</li></ul>
<blockquote><p>图集内容会持续更新。如果你也希望投稿自家后台的界面，欢迎在社区发帖联系我们。</p></blockquote>', '/index/images/cms/cms-cloud-analytics.png', '', '', '', 2, '2026-09-29T12:19:22.979Z', 0, '90000000000000000002', NULL, ARRAY['90000000000000000013']::varchar[], 1221, 103, 10, FALSE, FALSE, '', '', 0, TRUE, 'seed', 'seed', '2026-09-29T12:19:22.979Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000102', '图集精选：云端架构示意图', 'demo-gallery-04', '云端架构示意截图集，含单体、分布式与多租户三种部署形态。', '<p>这是一组云端架构示意的界面截图。图集里每一张都来自实际页面，配文说明设计意图与可复用的做法，方便你直接搬到自己的项目里。</p>
<h2>图集一览</h2>
<h3>单体起步形态</h3><img src="/index/images/cms/cms-ai-editorial.png" alt="单体起步形态" /><p>应用 + PostgreSQL + Redis 的最小可用组合，适合团队初期的快速交付，也是本地开发的默认形态。</p>
<h3>容器化部署形态</h3><img src="/index/images/cms/cms-cloud-analytics.png" alt="容器化部署形态" /><p>应用多副本挂在负载均衡后，上传目录走共享存储或对象存储，会话统一落在 Redis，实现横向扩容与滚动升级。</p>
<h3>多租户形态</h3><img src="/index/images/cms/cms-design-system.png" alt="多租户形态" /><p>通过组织树与数据权限组合隔离各租户数据，共用一套代码与实例，运维成本最低。</p>
<h2>可以复用的三点</h2>
<ul><li><strong>留白优先</strong>：先确定卡片之间的间距与容器内边距，再去调组件自身的边距，整体会干净很多。</li><li><strong>层级靠背景</strong>：不要用多层边框做区分，改用背景色与阴影拉开层级。</li><li><strong>操作要显眼</strong>：主操作唯一且位置固定，次级操作用弱化样式或收进下拉。</li></ul>
<blockquote><p>图集内容会持续更新。如果你也希望投稿自家后台的界面，欢迎在社区发帖联系我们。</p></blockquote>', '/index/images/cms/cms-ai-editorial.png', '', '', '', 2, '2026-09-29T12:19:22.979Z', 0, '90000000000000000007', NULL, ARRAY['90000000000000000010','90000000000000000013']::varchar[], 1168, 98, 8, FALSE, FALSE, '', '', 0, TRUE, 'seed', 'seed', '2026-09-29T12:19:22.979Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000030', '权限设计脑图', 'demo-download-03', '权限体系设计脑图源文件，含三层权限模型、角色矩阵与数据范围取值。', '<p>脑图用于在设计评审时快速对齐权限口径。相比通读文档，一张图更适合在白板上跟业务方确认"谁能看什么"。</p>
<h2>脑图结构</h2>
<ul><li><strong>菜单权限</strong>：路由注册、侧边栏渲染、面包屑归属；</li><li><strong>按钮权限</strong>：权限码命名规范、前后端一致性校验；</li><li><strong>数据权限</strong>：五种数据范围、复合组织场景；</li><li><strong>组织模型</strong>：左右值树、修复树关系的触发时机；</li><li><strong>角色设计</strong>：角色与组织的关系、多角色的取值冲突如何处理。</li></ul>
<img src="/index/images/cms/cms-ai-editorial.png" alt="权限设计脑图预览" />
<h2>怎么用</h2>
<p>下载后用 XMind 或兼容软件打开。建议在做权限设计评审前，先把自家角色按脑图第二层逐一填进去，缺失的分支就是还没想清楚的地方。</p>
<h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>XMind</td></tr><tr><td>层级</td><td>三层，共 30 余个节点</td></tr><tr><td>适用阶段</td><td>权限设计与评审</td></tr><tr><td>配套文档</td><td>见教程《权限模型详解》</td></tr></tbody></table>
<blockquote><p>多角色并存时，数据范围如何取值是最容易起争议的一条。建议在项目启动的第一次评审就把规则写死。</p></blockquote>', '/index/images/cms/cms-cloud-analytics.png', '权限设计脑图', '', '权限体系设计脑图源文件。', 2, '2026-09-25T02:00:00.000Z', 0, '90000000000000000005', NULL, ARRAY['90000000000000000012','90000000000000000016']::varchar[], 1115, 93, 13, FALSE, TRUE, '/files/meadmin-auth-mindmap.csv', 'meadmin-auth-mindmap.csv', 142, FALSE, '657558079876890624', '604612615536115712', '2026-09-20T02:00:00.000Z', '2026-10-10T14:52:48.081Z'),
  ('90000000000000000027', '图集精选：移动端适配合集', 'demo-gallery-02', '移动端响应式后台截图集，重点在小屏下的导航折叠与表格变形处理。', '<p>这是一组移动端响应式后台的界面截图。图集里每一张都来自实际页面，配文说明设计意图与可复用的做法，方便你直接搬到自己的项目里。</p>
<h2>图集一览</h2>
<h3>桌面端完整形态</h3><img src="/index/images/cms/cms-design-system.png" alt="桌面端完整形态" /><p>侧边栏常驻展开，表格走横向多列布局，筛选条件平铺在顶部工具栏，信息密度最高。</p>
<h3>平板断点</h3><img src="/index/images/cms/cms-cloud-analytics.png" alt="平板断点" /><p>宽度收窄后侧边栏自动折叠为图标条，列表卡片由多列降为两列，保留了主要操作入口。</p>
<h3>手机窄屏</h3><img src="/index/images/cms/cms-ai-editorial.png" alt="手机窄屏" /><p>表格切换为卡片流，一行一条、左图右文；工具栏收进抽屉；页脚导航变成单行简化版本。</p>
<h2>可以复用的三点</h2>
<ul><li><strong>留白优先</strong>：先确定卡片之间的间距与容器内边距，再去调组件自身的边距，整体会干净很多。</li><li><strong>层级靠背景</strong>：不要用多层边框做区分，改用背景色与阴影拉开层级。</li><li><strong>操作要显眼</strong>：主操作唯一且位置固定，次级操作用弱化样式或收进下拉。</li></ul>
<blockquote><p>图集内容会持续更新。如果你也希望投稿自家后台的界面，欢迎在社区发帖联系我们。</p></blockquote>', '/index/images/cms/cms-design-system.png', '图集精选：移动端适配合集', '', '移动端响应式后台界面截图集。', 2, '2026-09-24T05:00:00.000Z', 0, '90000000000000000001', NULL, ARRAY['90000000000000000013','90000000000000000015']::varchar[], 1062, 88, 6, FALSE, FALSE, '', '', 0, TRUE, '657558079876890624', '657558079876890624', '2026-09-22T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000025', '评论与举报：社区内容治理实践', 'demo-report-article', '社区内容怎么管：评论盖楼、私信与举报处置的完整链路，含后台处理要点。', '<p>开放评论意味着要承担内容治理成本。这篇把 meadmin CMS 插件里的评论、举报与审核流程串起来讲，适合作为搭建社区模块前的参考。</p>
<h2>一、评论的存储与展示</h2>
<p>评论采用父子结构存储，支持无限级回复，但<strong>前台只展开两级</strong>——更深层次的回复统一折叠到二级楼层里，避免楼层无限缩进后右侧内容被压成一条竖线。</p>
<img src="/index/images/cms/cms-cloud-analytics.png" alt="评论楼层展示效果" />
<p>每条评论记录作者、时间、点赞数与状态。状态分为正常、待审核、已折叠、已删除，前台只取正常态。</p>
<h2>二、为什么要限制登录</h2>
<p>匿名评论会带来两个硬伤：一是无法追溯责任人，举报处理失去抓手；二是垃圾评论几乎无法根治。因此插件默认只允许登录用户发言，未登录时按钮置灰并提示登录。</p>
<h2>三、举报的处置链路</h2>
<ol><li><strong>用户举报</strong>：在评论上点击"举报"，选择垃圾广告、人身攻击、不实信息等类型，可补充描述。</li><li><strong>后台汇总</strong>：举报进入后台列表，按被举报内容与处理状态筛选。</li><li><strong>管理员处置</strong>：判定成立后折叠或删除该评论，并回写处理结果；误报则直接关闭。</li><li><strong>结果反馈</strong>：处置结果记录在处理人字段上，便于事后复核。</li></ol>
<h2>四、审核机制怎么配</h2>
<table><thead><tr><th>配置项</th><th>建议值</th><th>说明</th></tr></thead><tbody><tr><td>评论是否需要审核</td><td>上线初期开启</td><td>冷启动阶段内容质量靠把关</td></tr><tr><td>单 IP 评论频率</td><td>按业务设定</td><td>拦截机器灌水</td></tr><tr><td>敏感词处理</td><td>替换为星号</td><td>直接拒绝容易误伤正常讨论</td></tr><tr><td>举报自动折叠阈值</td><td>3 次</td><td>达到阈值先自动折叠，人工再判</td></tr></tbody></table>
<h2>五、容易被忽略的一点</h2>
<p>举报处理的<strong>响应速度</strong>比规则本身更重要。用户看到自己举报的内容一天后还在，就会认为举报功能形同虚设。建议给值班角色配上消息提醒。</p>
<blockquote><p>内容治理没有一劳永逸的方案。规则要随着社区规模调整，建议每月复盘一次举报类型分布。</p></blockquote>', '/index/images/cms/cms-cloud-analytics.png', '评论与举报：社区内容治理实践', '', '演示评论盖楼、举报与后台审核流程。', 2, '2026-09-23T07:00:00.000Z', 0, '90000000000000000005', NULL, ARRAY['90000000000000000014','90000000000000000016']::varchar[], 1009, 83, 2, FALSE, FALSE, '', '', 0, FALSE, '657558079876890624', '657558079876890624', '2026-09-21T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000024', '客户案例：某水务集团的农村供水管理系统', 'demo-case-01', '复盘一个真实行业项目：从需求、选型到示范落地，含模块拆解与上线后的量化效果。', '<p>这是 meadmin 在水利行业的一次完整落地记录。客户是一家省级水务集团，需求是把分散在各个县市的水厂运行数据收拢到一个系统里。以下内容已做脱敏处理。</p>
<h2>一、项目背景</h2>
<p>集团下辖十余座水厂与多个县级管理站，此前各站点各自维护一套 Excel 台账，集团侧每月靠人工汇总。核心矛盾不是"没有系统"，而是数据口径不统一、上报滞后、无法追溯。</p>
<h2>二、需求拆解</h2>
<table><thead><tr><th>业务诉求</th><th>落地能力</th><th>对应模块</th></tr></thead><tbody><tr><td>按层级查看数据</td><td>省/市/县三级数据权限</td><td>组织 + 数据权限</td></tr><tr><td>台账在线化</td><td>可配置的业务表单</td><td>CRUD 生成 + 表单配置</td></tr><tr><td>台账可追溯</td><td>操作留痕</td><td>操作日志</td></tr><tr><td>报表导出</td><td>批量导出与打印</td><td>导出中心</td></tr><tr><td>移动端填报</td><td>响应式适配</td><td>响应式前端</td></tr></tbody></table>
<h2>三、为什么选 meadmin</h2>
<p>客户技术栈明确要求"自主可控、可二次开发"。评估时重点关注三点：</p>
<ol><li><strong>全栈同语言</strong>：前后端都是 TypeScript，客户团队不必维持两套技术能力。</li><li><strong>CRUD 可生成</strong>：大量台账类页面结构雷同，生成要比手写快一个数量级，后期维护也统一。</li><li><strong>权限是内置的</strong>：三级数据范围天然匹配集团的组织层级，不必从头造。</li></ol>
<h2>四、实施过程</h2>
<img src="/index/images/cms/cms-ai-editorial.png" alt="项目模块拆解示意" />
<p>整个项目分两期推进：一期做"看得见"，把台账在线化与三级权限打通；二期做"用得好"，补报表导出、移动填报与预警提醒。每期结束都安排一次现场培训。</p>
<h2>五、上线效果</h2>
<ul><li>月度汇总从人工 3 天缩短到系统实时出表；</li><li>数据口径统一后，跨区域对比第一次成为可能；</li><li>移动端填报覆盖到一线巡检人员，数据补录时效明显改善。</li></ul>
<h2>六、复盘</h2>
<p>最大的经验是：<strong>先把权限模型谈清楚，再写业务代码</strong>。项目早期我们低估了"县级管理站之间不能互看数据"带来的复杂度，后来通过角色 + 自定义组织范围才彻底理顺。第二点是培训要趁早，台账类系统上线的真正阻力往往来自操作习惯，而不是功能缺失。</p>
<p>如果你正在推进同类项目，可以直接联系我们获取完整实施方案。</p>', '/index/images/cms/cms-ai-editorial.png', '客户案例：某水务集团的农村供水管理系统', '', '复盘一个真实行业项目的技术选型与落地。', 2, '2026-09-22T02:00:00.000Z', 0, '90000000000000000003', '90000000000000000018', ARRAY['90000000000000000013','90000000000000000015']::varchar[], 956, 78, 6, TRUE, FALSE, '', '', 0, FALSE, '657558079876890624', '657558079876890624', '2026-09-18T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000023', '可视化大屏：用 ECharts 做运营看板', 'demo-lesson-04', '从数据聚合接口到 ECharts 配置，讲清运营看板的搭建顺序与暗色主题适配。', '<p>做看板最容易走进的误区，是先挑图表再找数据。正确顺序反过来：先确定要看什么指标，再决定聚合方式，最后才是图表形态。</p>
<h2>一、先确定指标，再谈图表</h2>
<p>以运营看板为例，值得放在第一屏的通常只有四类：</p>
<ul><li><strong>总量</strong>：累计用户数、订单总额、今日新增——用数字卡片。</li><li><strong>趋势</strong>：近 30 天日活——用折线图。</li><li><strong>结构</strong>：各渠道占比——用饼图或环形图。</li><li><strong>排名</strong>：Top 10 销售员——用横向柱状图。</li></ul>
<h2>二、后端给聚合结果，不要让前端算</h2>
<p>原始数据丢给前端做 group by 是看板最常见的性能陷阱。正确做法是后端提供聚合接口，一次返回可以直接喂给图表的数组：</p>
<pre><code>{
  "dates": ["09-01", "09-02", "09-03"],
  "views": [120, 186, 243],
  "orders": [12, 19, 26]
}</code></pre>
<p>配合 <code>echarts</code> 的 <code>setOption</code>，前端只需要把 series 的 data 换掉即可。若数据更新频繁，可以走定时轮询，避免引入 WebSocket 增加运维复杂度。</p>
<h2>三、图表配置三件套</h2>
<ol><li><strong>坐标轴边界留白</strong>：折线图打开 <code>boundaryGap: false</code>，让曲线贴边，观感更紧凑。</li><li><strong>tooltip 触发器</strong>：多系列用 <code>axis</code>，单系列用 <code>item</code>，否则悬浮体验会很糟。</li><li><strong>图例可交互</strong>：默认开启 <code>legend.selectedMode</code>，让用户自己隐藏不需要的系列。</li></ol>
<img src="/index/images/cms/cms-cloud-analytics.png" alt="运营看板图表效果" />
<h2>四、暗色主题与响应式</h2>
<p>看板通常挂在会议室大屏上，要同时处理两件事：</p>
<ul><li><strong>暗色模式</strong>：不要硬编码颜色，把背景、网格线、文字色抽成主题变量，跟随 <code>useDark</code> 切换。</li><li><strong>容器自适应</strong>：监听容器尺寸变化后调用 <code>resize()</code>，否则侧边栏折叠时画布会错位。</li></ul>
<p>另外记得给图表容器一个确定的高度。高度依赖内容撑开会导致 ECharts 初始化时拿到 0 高度，画出来就是一片空白。</p>
<blockquote><p>大屏项目建议把卡片的加载状态、空数据状态一并做进去。真实环境里接口超时远比想象中频繁。</p></blockquote>', '/index/images/cms/cms-cloud-analytics.png', '可视化大屏：用 ECharts 做运营看板', '', '从数据接口到图表配置的完整流程。', 2, '2026-09-20T08:00:00.000Z', 0, '90000000000000000002', NULL, ARRAY['90000000000000000011','90000000000000000013']::varchar[], 903, 73, 8, FALSE, FALSE, '', '', 0, FALSE, '657558079876890624', '657558079876890624', '2026-09-15T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000026', '图集精选：后台界面设计灵感', 'demo-gallery-01', '一组后台界面设计截图，含数据概览、深色模式与表单页三种典型场景。', '<p>这是一组后台界面设计的界面截图。图集里每一张都来自实际页面，配文说明设计意图与可复用的做法，方便你直接搬到自己的项目里。</p>
<h2>图集一览</h2>
<h3>数据概览页</h3><img src="/index/images/cms/cms-cloud-analytics.png" alt="数据概览页" /><p>第一屏用四个数字卡片承载总量指标，下方留 Trend 折线承接趋势。数字与标签拉开字重对比，扫一眼就能抓住重点。</p>
<h3>设置类页面</h3><img src="/index/images/cms/cms-design-system.png" alt="设置类页面" /><p>采用多 Tab 分组承载配置项，避免一个页面塞进几十个开关。Tab 顺序按照用户配置动线的先后顺序排列。</p>
<h3>内容编辑页</h3><img src="/index/images/cms/cms-ai-editorial.png" alt="内容编辑页" /><p>主编辑区占右侧宽幅，左侧收窄放置标题、分类、SEO 等元信息，符合"先填内容再补元数据"的实际写作习惯。</p>
<h2>可以复用的三点</h2>
<ul><li><strong>留白优先</strong>：先确定卡片之间的间距与容器内边距，再去调组件自身的边距，整体会干净很多。</li><li><strong>层级靠背景</strong>：不要用多层边框做区分，改用背景色与阴影拉开层级。</li><li><strong>操作要显眼</strong>：主操作唯一且位置固定，次级操作用弱化样式或收进下拉。</li></ul>
<blockquote><p>图集内容会持续更新。如果你也希望投稿自家后台的界面，欢迎在社区发帖联系我们。</p></blockquote>', '/index/images/cms/cms-design-system.png', '图集精选：后台界面设计灵感', '', '一组后台界面设计截图，用于首页图集展示。', 2, '2026-09-19T05:00:00.000Z', 0, '90000000000000000002', NULL, ARRAY['90000000000000000013','90000000000000000015']::varchar[], 850, 68, 10, FALSE, FALSE, '', '', 0, TRUE, '657558079876890624', '657558079876890624', '2026-09-17T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000029', '后台主题模板包', 'demo-download-02', '开箱即用的后台主题模板包，含配色变量、组件样例页与图标资源。', '<p>主题包解决的是"功能都有了，但界面不好看"的问题。它不改动任何业务逻辑，只提供一套经过调校的样式变量与页面样例。</p>
<h2>包内清单</h2>
<ul><li><strong>配色变量表</strong>：主色、成功/警告/危险色、中性灰阶，全部以 CSS 变量形式提供；</li><li><strong>组件样例页</strong>：表格、表单、抽屉、弹窗、标签页等常用组件的排版样例；</li><li><strong>深浅两套主题</strong>：切换跟随系统偏好，也可强制指定；</li><li><strong>图标资源</strong>：内置 SVG 图标集，按需加载，含在线替换面板。</li></ul>
<h2>怎么套用</h2>
<ol><li>解压后把样式目录放到前端项目的约定位置；</li><li>在项目入口处引入变量文件，覆盖默认 Token；</li><li>打开任意样例页，确认组件间距与圆角符合预期；</li><li>按自家品牌色调整主色变量，其余色阶会一并联动。</li></ol>
<img src="/index/images/cms/cms-design-system.png" alt="主题包样例页面" />
<h2>注意事项</h2>
<p>主题包只覆盖外观。若你的项目自定义过组件内部样式，可能需要同步调整选择器权重，避免被主题变量覆盖不完全。</p>
<h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>ZIP 压缩包</td></tr><tr><td>包含</td><td>样式变量 + 样例页 + 图标</td></tr><tr><td>依赖</td><td>Element Plus</td></tr><tr><td>许可</td><td>MIT</td></tr></tbody></table>', '/index/images/cms/cms-cloud-analytics.png', '后台主题模板包', '', '一套开箱即用的后台主题模板。', 2, '2026-09-18T02:00:00.000Z', 0, '90000000000000000001', NULL, ARRAY['90000000000000000015']::varchar[], 797, 63, 9, FALSE, TRUE, '/files/meadmin-theme-pack.csv', 'meadmin-theme-pack.csv', 205, FALSE, '657558079876890624', '604612615536115712', '2026-09-13T02:00:00.000Z', '2026-10-10T14:54:36.172Z'),
  ('90000000000000000022', '权限模型详解：数据权限与按钮权限', 'demo-lesson-03', '菜单权限、按钮权限、数据权限三层拆解，含数据范围取值说明与树结构修复要点。', '<p>权限是中后台最容易做歪的部分。很多系统只做了"能不能看这个菜单"，一旦追问"同一张表 张三能不能看到 李四的数据"就答不上来。meadmin 把权限拆成三层，这篇一次讲清。</p>
<h2>一、三层权限模型</h2>
<table><thead><tr><th>层级</th><th>控制粒度</th><th>典型表现</th></tr></thead><tbody><tr><td>菜单权限</td><td>路由与侧边栏</td><td>看不到某个模块的入口</td></tr><tr><td>按钮权限</td><td>页面上的操作</td><td>"删除""审核"按钮不显示</td></tr><tr><td>数据权限</td><td>接口返回的记录</td><td>同样一个列表，看到的行数不同</td></tr></tbody></table>
<p>三层是叠加关系：菜单决定能不能进，按钮决定能做什么操作，数据决定能看到哪些行。缺任何一层都会出现"看得见同事的工资条"这类事故。</p>
<h2>二、按钮权限怎么用</h2>
<p>后端在敏感接口上声明权限标识，前端用同一个标识包住按钮即可：</p>
<pre><code>&lt;el-button v-if="hasPermission(''aon_cms_article_delete'')"&gt;删除&lt;/el-button&gt;</code></pre>
<p>注意这只是<strong>视觉层隐藏</strong>，真正的拦截在服务端装饰器上。二者必须用同一套权限码，否则会出现"按钮点不了但接口能调通"或反之的错位。</p>
<h2>三、数据权限的五种范围</h2>
<p>数据权限通过角色的范围字段生效，取值范围如下：</p>
<table><thead><tr><th>取值</th><th>含义</th><th>适用场景</th></tr></thead><tbody><tr><td>0</td><td>全部数据</td><td>集团管理员、审计岗</td></tr><tr><td>1</td><td>自定义组织</td><td>大区负责人看指定几家分公司</td></tr><tr><td>2</td><td>仅本人</td><td>业务员只看自己的客户</td></tr><tr><td>3</td><td>仅本组织</td><td>部门经理看本部门</td></tr><tr><td>4</td><td>本组织及子组织</td><td>省公司看省内所有地市</td></tr></tbody></table>
<p>实现上，服务层会在查询构造阶段把范围条件并入 <code>where</code>，而不是查完再在内存里过滤——后者在数据量上来后会直接拖垮接口。</p>
<h2>四、组织树与"修复树关系"</h2>
<p>组织表采用左右值边界模型，查询子孙节点时不需要递归。但手工改过 <code>parent_id</code>、或者批量导入过数据之后，左右值可能与真实父子关系脱节，表现为"明明挂在下级却查不到"。</p>
<img src="/index/images/cms/cms-ai-editorial.png" alt="组织树结构示意" />
<p>遇到这种情况，在菜单、组织、角色三个模块里都有<strong>修复树关系</strong>按钮，点击即可重建左右值。建议在数据批量导入后固定执行一次。</p>
<blockquote><p>调整权限之后，记得让受影响的用户重新登录——权限已经计入会话缓存，不重登不会生效。</p></blockquote>', '/index/images/cms/cms-ai-editorial.png', '权限模型详解：数据权限与按钮权限', '', '一篇文章讲清 meadmin 的多维权限体系。', 2, '2026-09-17T03:00:00.000Z', 0, '90000000000000000005', NULL, ARRAY['90000000000000000012','90000000000000000016']::varchar[], 744, 58, 7, FALSE, FALSE, '', '', 0, FALSE, '657558079876890624', '657558079876890624', '2026-09-11T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000028', 'meadmin 快速上手手册（PDF）', 'demo-download-01', '一份可离线阅读的 PDF 上手手册，覆盖环境准备到第一个 CRUD 的完整步骤。', '<p>这份 PDF 是《meadmin 入门：五分钟搭建第一个后台》的离线版本，适合在无网络环境或内网机器上照着操作。手册内容与在线版保持一致，并补充了报错对照表。</p>
<h2>手册包含什么</h2>
<ul><li>环境清单与版本校验命令，含常见安装失败的排查办法；</li><li>脚手架初始化的每一步截图；</li><li>目录结构逐项说明，标注哪些目录是你需要改的、哪些不建议动；</li><li>CRUD 生成命令的完整参数表；</li><li>菜单同步与重新登录的操作步骤。</li></ul>
<h2>适合谁</h2>
<p>刚接触项目的新同事，或者需要在客户内网做交付演示的实施人员。建议先通读一遍再动手，遇到报错直接翻到文末附录。</p>
<h2>资源规格</h2><table><thead><tr><th>项目</th><th>说明</th></tr></thead><tbody><tr><td>格式</td><td>PDF</td></tr><tr><td>篇幅</td><td>约 40 页</td></tr><tr><td>更新频率</td><td>跟随主版本更新</td></tr><tr><td>阅读方式</td><td>下载后使用任意 PDF 阅读器</td></tr></tbody></table>
<h2>如何获取最新版</h2>
<p>点击文章顶部的下载按钮即可保存到本地。版本号印刷在封面右下角，若与当前发行版本不一致，说明有更新版本可以下载。</p>
<img src="/index/images/cms/cms-cloud-analytics.png" alt="手册封面预览" />
<blockquote><p>手册附带一份常见问题速查表，遇到"依赖装不上""端口被占用""数据库连接失败"三类问题可以先自查。</p></blockquote>', '/index/images/cms/cms-cloud-analytics.png', 'meadmin 快速上手手册（PDF）', '', '一份可下载的 PDF 上手手册。', 2, '2026-09-14T02:00:00.000Z', 0, '90000000000000000002', NULL, ARRAY['90000000000000000015']::varchar[], 691, 53, 9, FALSE, TRUE, '/files/meadmin-download-guide.csv', 'meadmin-download-guide.csv', 318, FALSE, '657558079876890624', '604612615536115712', '2026-09-09T02:00:00.000Z', '2026-10-10T14:54:36.288Z'),
  ('90000000000000000021', '云原生部署实践：把 meadmin 跑在 K8s 上', 'demo-lesson-02', '镜像构建、配置注入、健康检查与滚动升级，一篇讲清容器化落地全流程。', '<p>后台系统上了 K8s，最大的收益不是"能跑"，而是发版不再半夜停机。这篇把从 Dockerfile 到 Helm Chart 的完整链路拆开讲，重点放在容易被忽略的优雅退出与健康检查上。</p>
<h2>一、多阶段构建镜像</h2>
<p>meadmin 需要先执行 <code>mwtsc</code> 与 <code>vite build</code> 产出前端静态资源，因此构建期依赖不能被塞进运行镜像。推荐两段式：</p>
<pre><code># ---- build stage ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable &amp;&amp; pnpm install --frozen-lockfile
RUN pnpm build

# ---- runtime stage ----
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
EXPOSE 7001
CMD ["node", "./dist/bootstrap.js"]</code></pre>
<p>这样运行时镜像里只有产物与依赖，体积通常能压到构建镜像的三分之一以下。</p>
<h2>二、配置不要写进镜像</h2>
<p>数据库地址、Redis 密码、JWT 密钥这些必须走 ConfigMap 与 Secret，镜像保持与环境的无关性：</p>
<table><thead><tr><th>配置项</th><th>建议载体</th><th>原因</th></tr></thead><tbody><tr><td>数据库连接串</td><td>Secret</td><td>含用户名密码</td></tr><tr><td>Redis 地址</td><td>ConfigMap</td><td>随环境变化但非敏感</td></tr><tr><td>上传目录、OSS 桶名</td><td>ConfigMap</td><td>便于灰度切换</td></tr><tr><td>JWT 私钥</td><td>Secret</td><td>泄露即等于越权</td></tr></tbody></table>
<blockquote><p>切记不要用 latest 标签部署。线上应当固定到具体版本号或 digest，否则回滚时会回滚到"当时构建的那一版"以外的东西。</p></blockquote>
<h2>三、健康检查与优雅退出</h2>
<p>这两项是滚动升级不中断请求的关键。启动探针必须容忍首次编译与数据库迁移的时间，否则容器会在就绪前被反复杀死：</p>
<pre><code>livenessProbe:
  httpGet: { path: /api/admin/health, port: 7001 }
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet: { path: /api/admin/health/ready, port: 7001 }
  initialDelaySeconds: 10
  periodSeconds: 5
terminationGracePeriodSeconds: 30</code></pre>
<p>应用层还要监听 <code>SIGTERM</code>，收到信号后先停止接收新请求、等待存量请求完成，再关闭数据库连接与 Redis 连接。Midway 的生命周期钩子可以直接挂载这段逻辑。</p>
<h2>四、滚动升级</h2>
<p>配合上面的探针，一次零停机发布的完整顺序是：</p>
<ol><li>新版本 Pod 启动并就绪；</li><li>K8s 将新 Pod 加入 Service 后端；</li><li>旧 Pod 收到 SIGTERM，停止接新活；</li><li>等待优雅退出超时或存量请求结束，旧 Pod 销毁。</li></ol>
<img src="/index/images/cms/cms-design-system.png" alt="滚动升级过程示意" />
<h2>五、常见的三个坑</h2>
<ul><li><strong>上传目录没挂载持久化卷</strong>：Pod 重建后附件全部丢失，务必用 PVC 或对象存储。</li><li><strong>多副本下的定时任务重复执行</strong>：把定时任务抽成独立 Deployment，或者通过分布式锁保证单例。</li><li><strong>会话存在进程内存</strong>：会话必须落在 Redis，否则每次发布都会把用户踢下线。</li></ul>
<p>把这三点排掉，容器化就真正落地了。</p>', '/index/images/cms/cms-design-system.png', '云原生部署实践：把 meadmin 跑在 K8s 上', '', '详细介绍镜像构建、配置管理与滚动升级。', 2, '2026-09-13T06:00:00.000Z', 0, '90000000000000000001', '90000000000000000019', ARRAY['90000000000000000010','90000000000000000014']::varchar[], 638, 48, 4, TRUE, FALSE, '', '', 0, FALSE, '657558079876890624', '657558079876890624', '2026-09-07T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000020', 'meadmin 入门：五分钟搭建第一个后台', 'demo-lesson-01', '从脚手架初始化到生成第一个 CRUD 模块，完整走一遍 meadmin 的上手路径。', '<p>这是一篇面向新同学的上手指南。读完并跟着做一遍，你会得到一个可以登录、可以增删改查、带菜单与按钮权限的后台骨架——中间不需要手写一行权限判定代码。</p>
<h2>一、先确认四件事</h2>
<p>meadmin 是前后端同仓库的全栈工程，一次启动即可联调。动手前请确认本机已经具备下面四项依赖。</p>
<table><thead><tr><th>依赖</th><th>版本要求</th><th>用途</th></tr></thead><tbody><tr><td>Node.js</td><td>&gt;= 22.14.0</td><td>推荐 22 LTS，低版本在 workspace 解析阶段就可能失败</td></tr><tr><td>pnpm</td><td>&gt;= 9</td><td>由 pnpm workspace 管理多包，请勿用 npm / yarn 混装</td></tr><tr><td>PostgreSQL</td><td>&gt;= 14</td><td>ORM 为 Sequelize 7，默认模式名 meadmin</td></tr><tr><td>Redis</td><td>&gt;= 6</td><td>存放会话、验证码与热点缓存</td></tr></tbody></table>
<h2>二、一条命令初始化</h2>
<p>不需要 clone 仓库，脚手架会把模板拉到本地并完成依赖改名：</p>
<pre><code>pnpm create meadminjs@latest my-admin
cd my-admin
pnpm install</code></pre>
<p>初始化完成后，你会看到这样的目录分布：</p>
<pre><code>packages/   cli、core、create-meadmin、midway-vite-view
view/       admin 管理前端、index 前台（SSR）
addons/     插件目录，例如 cms、doc
src/        Midway 后端：controller / service / entities / dto / dict / config</code></pre>
<p>后端只有一个应用，插件通过 <code>addons/</code> 目录挂载，这正是 meadmin 支持"即插即用"的关键。</p>
<h2>三、配置本地环境</h2>
<p>复制环境变量文件并填入你的数据库与 Redis 连接串：</p>
<pre><code>cp .env.local.example .env.local
# 修改 DATABASE / REDIS 相关变量
pnpm dev</code></pre>
<p>启动成功后，两个入口分别监听在同一个端口 <code>7001</code> 上：</p>
<ul><li>后台管理：<code>http://localhost:7001/admin</code></li><li>前台站点：<code>http://localhost:7001/</code></li></ul>
<h2>四、生成第一个 CRUD</h2>
<p>这是 meadmin 最有价值的一步。假设我们要做一张"供应商"表，只要建好实体，其余全部由 CLI 生成：</p>
<pre><code>npx meadmin crud supplier</code></pre>
<p>命令会依次产出后端实体、DTO、Service、Controller，以及前端的列表页、表单抽屉、语言包和菜单 SQL。生成完成后执行一次菜单同步，重新登录即可在侧边栏看到新模块。</p>
<h2>五、检查这三处，确认真的跑通了</h2>
<ol><li><strong>菜单可见</strong>：新模块出现在侧边栏，说明菜单与路由注册成功。</li><li><strong>列表有数据</strong>：新增一条记录后列表能查出来，说明读写链路通畅。</li><li><strong>按钮权限生效</strong>：换一个角色登录，"删除"按钮应自动隐藏。</li></ol>
<img src="/index/images/cms/cms-cloud-analytics.png" alt="meadmin 后台数据概览" />
<p>如果第三步没有生效，通常是菜单权限没有同步到角色，去角色管理里重新授权一次即可。</p>
<blockquote><p>下一步建议阅读《权限模型详解：数据权限与按钮权限》，把 RBAC 的三种粒度搞清楚，后面的业务模块会顺很多。</p></blockquote>', '/index/images/cms/cms-cloud-analytics.png', 'meadmin 入门：五分钟搭建第一个后台', '', '从安装到第一个 CRUD，跟随本文快速上手 meadmin 全栈一站式后台。', 2, '2026-09-09T01:30:00.000Z', 0, '90000000000000000002', '90000000000000000017', ARRAY['90000000000000000011','90000000000000000015']::varchar[], 585, 43, 6, FALSE, FALSE, '', '', 0, FALSE, '657558079876890624', '657558079876890624', '2026-09-04T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000034', '（已下线）临时公告', 'demo-offline-01', '曾发布后主动下线的临时公告，用于演示下线态对前台可见性的影响。', '<blockquote><p>本公告已下线，内容不再适用。以下为原文存档。</p></blockquote>
<h2>临时公告</h2>
<p>因机房线路割接，本站点将于本周六凌晨进行短暂维护，期间后台登录可能受到影响。维护窗口预计在一小时内结束。</p>
<h2>影响范围</h2>
<ul><li>后台管理端：维护期间可能无法登录；</li><li>前台站点：静态页面不受影响；</li><li>接口服务：可能出现短暂超时。</li></ul>
<h2>当前状态</h2>
<p>维护工作已经完成，服务恢复正常。本公告保留在存档中，用于演示"已下线"状态——该状态下的内容会在前台所有列表与搜索结果中隐藏，但后台仍可查阅与管理。</p>
<p>若你需要恢复本条内容的可见性，可在后台将状态改回"已发布"，并重新确认发布时间。</p>', '/index/images/cms/cms-ai-editorial.png', '（已下线）临时公告', '', '曾发布但已下线的临时公告。', 4, '2026-08-30T02:00:00.000Z', 0, '90000000000000000005', NULL, ARRAY[]::varchar[], 532, 38, 9, FALSE, FALSE, '', '', 0, FALSE, '657558079876890624', '604612615536115712', '2026-08-28T02:00:00.000Z', '2026-09-29T15:06:02.129Z'),
  ('90000000000000000031', '（草稿）下一代表单引擎设想', 'demo-draft-01', '尚未完成的表单引擎设计草稿，用于演示草稿态在前台的可见性与后台流转。', '<blockquote><p>本文为草稿，内容尚未完成，仅用于演示草稿状态。正式版本将在完成评审后发布。</p></blockquote>
<h2>待补充的部分</h2>
<ul><li><strong>动态渲染方案</strong>：JSON Schema 与独立的 UI 描述如何选择，两者的取舍还没定。</li><li><strong>联动规则的边界</strong>：字段间的显隐联动，是否要支持跨表单引用。</li><li><strong>校验时机</strong>：失焦即校验还是提交时统一校验。</li><li><strong>权限到字段</strong>：字段级的可见/可编辑权限如何与现有按钮权限打通。</li></ul>
<h2>已确认的原则</h2>
<ol><li>表单引擎生成的结果，必须能被标准 CRUD 生成器接管，不做两套。</li><li>所有配置走现有的配置体系，不新增独立的配置存储。</li><li>移动端与桌面端共用一份配置，允许单独指定断点下的列宽。</li></ol>
<h2>暂不考虑</h2>
<p>流程编排不在本期的范围内。表单引擎只负责单个表单的结构与校验，流转逻辑留给上层业务。</p>
<p><em>（后续章节待补：字段类型清单、渲染器接口定义、与文件上传组件的对接方式。）</em></p>', '/index/images/cms/cms-cloud-analytics.png', '（草稿）下一代表单引擎设想', '', '尚未完成的表单引擎设计草稿。', 1, NULL, 0, '90000000000000000002', NULL, ARRAY['90000000000000000011']::varchar[], 479, 33, 10, FALSE, FALSE, '', '', 0, FALSE, '657558079876890624', '604612615536115712', '2026-09-26T02:00:00.000Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000033', '（已拒绝）旧版部署文档', 'demo-rejected-01', '已被审核拒绝的旧文档，保留用于演示拒绝态与拒绝原因的留痕。', '<blockquote><p>本文未通过审核，仅作为历史记录保留，内容可能已过时，请勿据此操作。</p></blockquote>
<h2>为什么被拒绝</h2>
<p>审核意见记录如下，供后续修订参考：</p>
<ul><li>文中描述的部署目录结构为早期版本，与当前 monorepo 结构已不一致；</li><li>环境变量的取名方式在版本号调整后失效，会导致启动失败；</li><li>缺少回滚章节，不符合运维类文档的最低要求。</li></ul>
<h2>以下为原文（已停用的旧部署方式）</h2>
<p>早期部署需要分别对后端和前端执行构建，再手工把前端产物拷贝到后端的静态目录。这种方式在多包工作区改造后已被弃用，当前版本通过 <code>pnpm build</code> 一次性完成构建。</p>
<h2>修订方向</h2>
<ol><li>按当前目录结构重写全篇；</li><li>补充镜像构建与滚动升级章节；</li><li>增加"发布失败如何回滚"一节。</li></ol>
<blockquote><p>如果把本文档作为参考，请改用帮助中心中的《部署与运维手册》，那里的操作步骤与当前结构一致。</p></blockquote>', '/index/images/cms/cms-cloud-analytics.png', '（已拒绝）旧版部署文档', '', '已被拒绝的旧文档，保留用于演示。', 3, NULL, 0, '90000000000000000006', NULL, ARRAY[]::varchar[], 373, 23, 8, FALSE, FALSE, '', '', 0, FALSE, '657558079876890624', '657558079876890624', '2026-09-21T02:00:00.000Z', '2026-09-29T13:40:20.059Z')
ON CONFLICT ("id") DO NOTHING;

-- 评论
INSERT INTO aon_cms_comment ("id", "article_id", "parent_id", "user_id", "author", "author_avatar", "content", "status", "report_count", "report_reason", "reported_at", "lock_version", "left", "right", "created_admin_id", "updated_admin_id", "created_at", "updated_at")
VALUES
  ('02bbf6a63f34ec7797ff', '90000000000000000034', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('0400160068e1c05e0fca', '90000000000000000032', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('051f3ad1d4125c50f2a1', '90000000000000000033', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('05575e4b1fe87130fd16', '90000000000000000101', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('0606d6c57eca7f09fa02', '90000000000000000024', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('064018ec7a4147cd93da', '90000000000000000035', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('085cf0234389799e0bdd', '90000000000000000125', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('0a41b1e0c1e750ec3003', '90000000000000000021', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('0aad5ec27f5158ffb047', '90000000000000000031', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('0f17679ef5e3fa36588f', '90000000000000000126', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T14:15:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('10bda4ac03f495edaf08', '90000000000000000130', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('1173c188d6535eb417c2', '90000000000000000129', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('182998762be34cd18c19', '90000000000000000133', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('1883d5f6060964134b72', '90000000000000000027', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('1ba5106135bad2077f06', '90000000000000000030', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('331774157de0e53ef8d8', '90000000000000000023', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('375d477aa938cf0c8c59', '90000000000000000127', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('3d92789c645db1d790d8', '90000000000000000120', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('4935451f00ae0d5b6f30', '90000000000000000128', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('4c5c5bc06019cd028c47', '90000000000000000124', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('52cf03a9b0165dd81498', '90000000000000000026', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('5eb17842edb728c1eaea', '90000000000000000121', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('6b45746fef8865b94c58', '90000000000000000029', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('6d3425946e86e58e8bf4', '90000000000000000123', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('71669bb8a247f1a9d0a1', '90000000000000000122', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('8bcf4e48940902b906ca', '90000000000000000022', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('8f323bc0cb861a9890db', '90000000000000000131', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000044', '90000000000000000020', NULL, '757593885013704704', 'CMS演示用户', '', '文章写得很清晰，跟着做一遍就跑起来了！', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-10T04:00:00.000Z', '2026-09-29T15:40:34.151Z'),
  ('90000000000000000051', '90000000000000000025', NULL, '757594002051563520', '访客甲', '', '这条评论包含不当内容，已被多人举报。', 1, 3, '涉嫌广告与不当言论', '2026-09-24T12:00:00.000Z', '', '1', '4', NULL, NULL, '2026-09-23T12:00:00.000Z', '2026-09-24T12:00:00.000Z'),
  ('9c8f0413ed341864f8c5', '90000000000000000102', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '1', '6', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('a63d6e60e1d95e61a3eb', '90000000000000000132', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('cb3a86b9e1481176574c', '90000000000000000028', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '1', '8', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('0870c54d7b146ee95e0e', '90000000000000000121', '5eb17842edb728c1eaea', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('0c50f23bc0e2c4adbed4', '90000000000000000123', '6d3425946e86e58e8bf4', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('21dac31fd88d28596f96', '90000000000000000028', 'cb3a86b9e1481176574c', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('2673a558cb79ccae04ac', '90000000000000000034', '02bbf6a63f34ec7797ff', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('3b2caa8598bc434fbc2a', '90000000000000000127', '375d477aa938cf0c8c59', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('3bb58a538b8bdda60686', '90000000000000000129', '1173c188d6535eb417c2', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('428fda33164e22579a8d', '90000000000000000130', '10bda4ac03f495edaf08', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('491e7bc5eb697a2086d3', '90000000000000000033', '051f3ad1d4125c50f2a1', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('4d1e0cbb18ff5afb1464', '90000000000000000124', '4c5c5bc06019cd028c47', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('4d6ede2b15199b9044b7', '90000000000000000022', '8bcf4e48940902b906ca', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('4ea1aee2a1d55689445c', '90000000000000000027', '1883d5f6060964134b72', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('4f9bcc196efd1a87e11f', '90000000000000000128', '4935451f00ae0d5b6f30', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('50207d6cc7950eac6a84', '90000000000000000132', 'a63d6e60e1d95e61a3eb', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('53c52fd125c1798be98c', '90000000000000000102', '9c8f0413ed341864f8c5', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('580e28e5b3199c0a63e3', '90000000000000000101', '05575e4b1fe87130fd16', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('65a122743ab6eb3b8839', '90000000000000000031', '0aad5ec27f5158ffb047', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('6f23e7c275359c041cc0', '90000000000000000035', '064018ec7a4147cd93da', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('77e6c3efe24acd5d72c7', '90000000000000000125', '085cf0234389799e0bdd', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('81a73ef05d3dd53d67fb', '90000000000000000133', '182998762be34cd18c19', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('841dd97570eef8f0ac72', '90000000000000000029', '6b45746fef8865b94c58', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('85d8806972ec957ef1f9', '90000000000000000131', '8f323bc0cb861a9890db', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000045', '90000000000000000020', '90000000000000000044', '757594002051563520', '访客甲', '', '请问自定义字段要怎么加？', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-10T04:00:00.000Z', '2026-09-29T15:40:34.151Z'),
  ('90000000000000000052', '90000000000000000025', NULL, '757593885013704704', 'CMS演示用户', '', '正常的讨论评论，未被举报。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-23T13:00:00.000Z', '2026-09-23T13:00:00.000Z'),
  ('930df5ba26e83f6ce64a', '90000000000000000120', '3d92789c645db1d790d8', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('a275d2aed75fb43bdb39', '90000000000000000026', '52cf03a9b0165dd81498', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('a571b0a18e68215e84c1', '90000000000000000030', '1ba5106135bad2077f06', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('afec9101f77dfefed292', '90000000000000000122', '71669bb8a247f1a9d0a1', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('b24385e02eb9f9b88281', '90000000000000000021', '0a41b1e0c1e750ec3003', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('be0fd14d12956660eda4', '90000000000000000024', '0606d6c57eca7f09fa02', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '2', '7', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('c7a413594784f2d80d66', '90000000000000000023', '331774157de0e53ef8d8', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('f991fb5f3eb9417d7a6e', '90000000000000000032', '0400160068e1c05e0fca', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('ff9c5c16b70ee61908e0', '90000000000000000126', '0f17679ef5e3fa36588f', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '2', '5', NULL, NULL, '2026-09-29T14:18:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('03c3ecbeb9bd00facb28', '90000000000000000024', 'be0fd14d12956660eda4', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:00:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('1762aea2e61b74459b9e', '90000000000000000031', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('1bb5ccfa805a02aaa455', '90000000000000000122', 'afec9101f77dfefed292', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:00:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('1d06751753e49726d94a', '90000000000000000022', '4d6ede2b15199b9044b7', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('1de8257e14fe4b179fbd', '90000000000000000027', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '3', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('2c416ccae3f3f40249fe', '90000000000000000126', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('45cdb03b616ed162f0e5', '90000000000000000125', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('45e31b121d268cf14bee', '90000000000000000023', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('48e04b2e23d105d98e69', '90000000000000000120', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '3', '8', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('49456756a6491cd35b13', '90000000000000000133', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '3', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('550eb844228e6d00e5c6', '90000000000000000035', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '3', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('5a2e59ba55e6b09f683a', '90000000000000000124', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '3', '8', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('5aadaf039fb89965b229', '90000000000000000128', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:15:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('5e790ed79b97040523f5', '90000000000000000028', '21dac31fd88d28596f96', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('71fe2cfac2abbf567ef7', '90000000000000000123', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('73e5fca7f1c0eb4f2e48', '90000000000000000021', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '3', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('746b73188d99973a6795', '90000000000000000030', 'a571b0a18e68215e84c1', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:14:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('752af8e5079b5a69804d', '90000000000000000130', '428fda33164e22579a8d', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('85cf71b6c6388a9e9fc1', '90000000000000000129', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '3', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('8bce587c9bfdc905955b', '90000000000000000033', '491e7bc5eb697a2086d3', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000046', '90000000000000000020', '90000000000000000045', '657558079876890624', '测试账户', '', '在实体里加字段，然后同步迁移即可。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-10T04:00:00.000Z', '2026-09-29T15:40:34.151Z'),
  ('984c077fd3d01aa258a9', '90000000000000000029', '841dd97570eef8f0ac72', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('a2dcc6edf1618e05a2bd', '90000000000000000121', '0870c54d7b146ee95e0e', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('a4301f7d273be693bca8', '90000000000000000026', 'a275d2aed75fb43bdb39', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:14:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('b22d21335dce8a21e4c6', '90000000000000000032', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '3', '8', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('be559872585bc71b1003', '90000000000000000102', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('d28372b25d3885733c9b', '90000000000000000131', '85d8806972ec957ef1f9', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('dfbe83eac0574f27f804', '90000000000000000127', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '3', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('e305cbea659d6961a89b', '90000000000000000034', '2673a558cb79ccae04ac', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:00:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('e7bfc85a082f1d096aeb', '90000000000000000132', '50207d6cc7950eac6a84', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('f280ed79876c3bd54acc', '90000000000000000101', '580e28e5b3199c0a63e3', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '3', '6', NULL, NULL, '2026-09-29T14:14:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('1c4bd637bb2c9960563b', '90000000000000000024', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('1f0841fd6e7292dc409c', '90000000000000000030', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T14:15:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('29e9f3b6b8cd8c9e7dc0', '90000000000000000129', '85cf71b6c6388a9e9fc1', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('32a71131b8495f7f0f23', '90000000000000000120', '48e04b2e23d105d98e69', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('38e8723456f8a9d0fee0', '90000000000000000123', '71fe2cfac2abbf567ef7', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('39d77ccebdc1416718d5', '90000000000000000033', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('564be54685454de180c2', '90000000000000000130', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T14:15:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('5f6a1762b1f4a16d37ab', '90000000000000000026', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('6f6530393dded7b4e3af', '90000000000000000029', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('71334f623e42ad4ba69f', '90000000000000000124', '5a2e59ba55e6b09f683a', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('7396cd752bedc8d0fb01', '90000000000000000032', 'b22d21335dce8a21e4c6', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('742414564f82917522c5', '90000000000000000122', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T14:15:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('81c18b518d9923e31506', '90000000000000000101', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('82b81a2ce270b4f82d1e', '90000000000000000102', 'be559872585bc71b1003', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('862574f0c52c4c6eb8bf', '90000000000000000031', '1762aea2e61b74459b9e', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('8da23f116e23c3ab4f2d', '90000000000000000034', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('8efffb8ce076a338c1b7', '90000000000000000022', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('90000000000000000047', '90000000000000000020', '90000000000000000046', '757593885013704704', 'CMS演示用户', '', '明白了，谢谢！', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-10T04:00:00.000Z', '2026-09-10T04:00:00.000Z'),
  ('961f48c14691e7be1515', '90000000000000000131', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('b5198b7b28879b26f0bd', '90000000000000000035', '550eb844228e6d00e5c6', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('b6d2027a0a324b0cf0e8', '90000000000000000132', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('b73a4b42fa83ef968c10', '90000000000000000121', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('b9a5b225b3178fa53cce', '90000000000000000021', '73e5fca7f1c0eb4f2e48', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('ba8388a1a36ee122b941', '90000000000000000027', '1de8257e14fe4b179fbd', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('c9a25f7330a046b93ce8', '90000000000000000127', 'dfbe83eac0574f27f804', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('d20157328fac894fb919', '90000000000000000028', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('e34768caaddd46f66410', '90000000000000000128', '5aadaf039fb89965b229', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T14:18:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('e42e6d14513cf878fb94', '90000000000000000126', '2c416ccae3f3f40249fe', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('e58197fef377e2a83b9d', '90000000000000000133', '49456756a6491cd35b13', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '4', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('e88daf7475865bde9461', '90000000000000000023', '45e31b121d268cf14bee', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('f800fa9619a079e9a267', '90000000000000000125', '45cdb03b616ed162f0e5', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '4', '9', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('040ed8eb07386d8b9d17', '90000000000000000132', 'b6d2027a0a324b0cf0e8', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('049d250d7053b8fb4602', '90000000000000000125', 'f800fa9619a079e9a267', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('1a12ae4c9c8f320163e7', '90000000000000000130', '564be54685454de180c2', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:18:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('1ab263a0014f20dc3ded', '90000000000000000131', '961f48c14691e7be1515', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('1aca750975dfe454edf4', '90000000000000000034', '8da23f116e23c3ab4f2d', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('36bbebc5f143a681a920', '90000000000000000101', '81c18b518d9923e31506', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('39c13a4b24b671fcdce5', '90000000000000000028', 'd20157328fac894fb919', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('4b845239a0964e0e3ce9', '90000000000000000027', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('4d43554dbc78f7760082', '90000000000000000126', 'e42e6d14513cf878fb94', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('4f2292b2ce57d7480f6e', '90000000000000000133', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('5267536dbfc0e003eaae', '90000000000000000122', '742414564f82917522c5', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T14:18:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('5330f575be3e9124e0f0', '90000000000000000123', '38e8723456f8a9d0fee0', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:00:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('58a237d4b8328930871a', '90000000000000000030', '1f0841fd6e7292dc409c', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:18:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('5d4bfadc35f242932d22', '90000000000000000120', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('774a06a7df1ecef0b2ae', '90000000000000000128', 'e34768caaddd46f66410', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:21:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('8171ab5c2e72136b8731', '90000000000000000026', '5f6a1762b1f4a16d37ab', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('84e7207baf0536ef5842', '90000000000000000035', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:15:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('90000000000000000048', '90000000000000000020', '90000000000000000047', '757594002051563520', '访客甲', '', '顺便问下支持树形菜单吗？', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-10T04:00:00.000Z', '2026-09-10T04:00:00.000Z'),
  ('97cb8ab73a4c2289de57', '90000000000000000121', 'b73a4b42fa83ef968c10', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('a175c6019046b6eb3d5c', '90000000000000000124', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('ab9f7045a5981054df31', '90000000000000000029', '6f6530393dded7b4e3af', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('bf22bbd9062425d9d5be', '90000000000000000022', '8efffb8ce076a338c1b7', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('c33400e07d3a1e3e6c86', '90000000000000000033', '39d77ccebdc1416718d5', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('d9ee673e368acc2189a8', '90000000000000000023', 'e88daf7475865bde9461', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('da2f16dd2086f7e4dda1', '90000000000000000031', '862574f0c52c4c6eb8bf', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('e815aa111794c54cb2a3', '90000000000000000102', '82b81a2ce270b4f82d1e', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T13:40:20.059Z'),
  ('ec6bd11633632321bd86', '90000000000000000024', '1c4bd637bb2c9960563b', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '5', '6', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('f6220bb5d365b976d734', '90000000000000000032', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '5', '8', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('1752958930e568322ee2', '90000000000000000123', 'b6751685f15ab70ab247', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('1c2fc889eb5925d747a8', '90000000000000000122', 'bf35bb30a15d09f7353f', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('2ebe8e6353d4554fbbd4', '90000000000000000031', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('409acb26815f340633cb', '90000000000000000030', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('40cdbf5fea01b9e98022', '90000000000000000035', '84e7207baf0536ef5842', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T14:18:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('4361cabac20a96aa6bbf', '90000000000000000033', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('540d0bdab3560f24c563', '90000000000000000031', '95a1e510dc0be0657b20', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('656bd25703c4bba9b1f7', '90000000000000000126', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('69f75909cbf40748d69c', '90000000000000000101', 'ba5699c87d6f657cae0e', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('6ab339bd5fa7287227f8', '90000000000000000023', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('6bdd5bd4101acc6b3392', '90000000000000000130', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('76429db7fd08885d7a12', '90000000000000000128', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('80237fc18438bfb394b9', '90000000000000000120', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '6', '11', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('8510af7f6dc0c754ff0f', '90000000000000000032', 'f6220bb5d365b976d734', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('87afd6d1053cecab08c9', '90000000000000000126', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '6', '13', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('9b17d6dac07d3f8f5530', '90000000000000000022', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('9b9fba43b45c83587ff2', '90000000000000000128', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '6', '11', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('a3c3d337b6e4092d7f16', '90000000000000000101', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('ae1828e6e38fecbe4978', '90000000000000000123', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('b82cdd13c24f637d2467', '90000000000000000125', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('b96a22e09e5d35bb2f99', '90000000000000000130', '88bfca58cccc1b072d21', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '6', '11', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('bda26599283b48dff076', '90000000000000000125', 'b7dfbef2f145167e13a4', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T14:00:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('cd6cb3b16695dc994872', '90000000000000000030', 'd56c08a131a8e13da0c6', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('d7aa2dbe618e9b5a23b6', '90000000000000000026', '8ae4dae2dbae4457379b', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('e00273e11e89f01b597d', '90000000000000000121', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('f06a15383c376f4612a3', '90000000000000000035', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '6', '11', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('f46002e2f38e5c38765b', '90000000000000000120', '5d4bfadc35f242932d22', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('f6d9e9932a79aa32b847', '90000000000000000132', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '6', '7', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('f953c7d0159d19062047', '90000000000000000102', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '6', '9', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('09296a95b2a47fcc9b9f', '90000000000000000132', 'f6d9e9932a79aa32b847', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('0b19b63c9119c3ca1ab1', '90000000000000000022', '9b17d6dac07d3f8f5530', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('114867b4ba50235f853a', '90000000000000000102', 'f953c7d0159d19062047', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('182363d372e023b4acc9', '90000000000000000130', 'b96a22e09e5d35bb2f99', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '7', '10', NULL, NULL, '2026-09-29T14:00:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('5dd46d3aba4eae66eb76', '90000000000000000031', '2ebe8e6353d4554fbbd4', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('6579ecda618000c58299', '90000000000000000126', '656bd25703c4bba9b1f7', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('66535813e0f0c03d50c4', '90000000000000000120', '80237fc18438bfb394b9', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '7', '10', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('66e2072d69f58e62ba1a', '90000000000000000120', 'f46002e2f38e5c38765b', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T14:14:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('69bb261baff1925164d8', '90000000000000000035', '40cdbf5fea01b9e98022', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T14:21:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('6a09c42553a16ad74e98', '90000000000000000128', '76429db7fd08885d7a12', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('7c286e1894c98dd1840f', '90000000000000000035', 'f06a15383c376f4612a3', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '7', '10', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('814b65e64066f47b0691', '90000000000000000123', 'ae1828e6e38fecbe4978', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('84d5c654cfa01761a303', '90000000000000000026', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('8550fda6dd8ab9060a13', '90000000000000000126', '87afd6d1053cecab08c9', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '7', '12', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('8972cb65e47994188703', '90000000000000000122', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('8e8802a46c7d5480e0c8', '90000000000000000032', '8510af7f6dc0c754ff0f', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T14:00:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('90c48910d618ee7fe84e', '90000000000000000030', '409acb26815f340633cb', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('a9b01b7d37176fcc7fb8', '90000000000000000033', '4361cabac20a96aa6bbf', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('aad27770a9208785a6e2', '90000000000000000128', '9b9fba43b45c83587ff2', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '7', '10', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('ae0c88ec457f5676bb38', '90000000000000000030', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '7', '14', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('b3a0d2cfb405e14ea87e', '90000000000000000034', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '7', '10', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('b422640be66da33e4980', '90000000000000000029', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '7', '10', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('bdd941796f626a2e3ffa', '90000000000000000121', 'e00273e11e89f01b597d', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('d86e7af04f2dccd1bd17', '90000000000000000125', 'b82cdd13c24f637d2467', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('d8b0d3976f841a889e56', '90000000000000000124', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '7', '10', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('e02e9f6be7bf0ab2596f', '90000000000000000130', '6bdd5bd4101acc6b3392', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('e3c35bc7d52b5a282ee6', '90000000000000000028', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '7', '10', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('e46b638457a6fd6ed03e', '90000000000000000133', NULL, '', '读者A', '', '这篇内容很实用，感谢作者分享！', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('ef8f99ce1dc9b30728b1', '90000000000000000101', 'a3c3d337b6e4092d7f16', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '7', '6', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('f1dbd385d1d0ebf5f621', '90000000000000000023', '6ab339bd5fa7287227f8', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '7', '8', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('f56c85e8e2aed09caecd', '90000000000000000122', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '7', '14', NULL, NULL, '2026-09-29T14:08:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('085925bbd58d31481397', '90000000000000000028', 'e3c35bc7d52b5a282ee6', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '8', '9', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('249e2a70d50bab50b99c', '90000000000000000121', 'bdd941796f626a2e3ffa', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('3bd1e9f12e3322cfbc20', '90000000000000000133', 'e46b638457a6fd6ed03e', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('502b5eff270fc718d65b', '90000000000000000122', 'f56c85e8e2aed09caecd', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '8', '13', NULL, NULL, '2026-09-29T14:11:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('5999310b6a9157e89169', '90000000000000000130', 'e02e9f6be7bf0ab2596f', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T14:14:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('69a62f7f2713b552e099', '90000000000000000120', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '8', '9', NULL, NULL, '2026-09-29T14:15:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('69bc581ec0f58a905c87', '90000000000000000023', 'f1dbd385d1d0ebf5f621', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('7e6954acaf39faa169eb', '90000000000000000031', '5dd46d3aba4eae66eb76', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('7e6b70a4833850069a9c', '90000000000000000122', '8972cb65e47994188703', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('807a764fd97d50946bfd', '90000000000000000128', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '8', '9', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('84cbdb48c12f601a13df', '90000000000000000126', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '8', '9', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('8aa05851f9de5cef2211', '90000000000000000123', '814b65e64066f47b0691', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('8d04799368006aa3f6f5', '90000000000000000030', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '8', '11', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('90000000000000000050', '90000000000000000020', '90000000000000000049', '757594002051563520', '访客甲', '', '这条还在审核中。', 0, 0, '', NULL, '', '8', '9', NULL, NULL, '2026-09-10T04:00:00.000Z', '2026-09-29T15:40:34.169Z'),
  ('94386fdcb4cbf99e58d3', '90000000000000000029', 'b422640be66da33e4980', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '8', '9', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('9505093f35f2ad812c43', '90000000000000000033', 'a9b01b7d37176fcc7fb8', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('99ff2b66c25c4713b4c5', '90000000000000000035', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '8', '9', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('aa13ca156cf5786671bf', '90000000000000000030', 'ae0c88ec457f5676bb38', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '8', '13', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('b5158bf647ca5afe6afd', '90000000000000000102', '114867b4ba50235f853a', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T14:00:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('b691b12e62b88b194162', '90000000000000000130', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '8', '13', NULL, NULL, '2026-09-29T13:47:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('c2bcd6d26ffdb007ace6', '90000000000000000125', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '8', '11', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('cf8423f7c7058b111056', '90000000000000000124', 'd8b0d3976f841a889e56', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '8', '9', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('d369976a65c0b82a10b0', '90000000000000000126', '8550fda6dd8ab9060a13', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '8', '11', NULL, NULL, '2026-09-29T14:14:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('e8183c64c5cff9d097a1', '90000000000000000034', 'b3a0d2cfb405e14ea87e', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '8', '9', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('f3dbf1532aca54c5bd5f', '90000000000000000026', '84d5c654cfa01761a303', '', '读者A', '', '同意，我们项目里也是这么落地的。', 1, 0, '', NULL, '', '8', '7', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('f50516a8d702aa2b622a', '90000000000000000101', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '8', '11', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('19b05418f4874a47f496', '90000000000000000126', '84cbdb48c12f601a13df', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '9', '8', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('37747dd7da4018ff97a7', '90000000000000000120', '69a62f7f2713b552e099', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '9', '8', NULL, NULL, '2026-09-29T14:18:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('39569be1f31d9dcd34e4', '90000000000000000030', 'aa13ca156cf5786671bf', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '9', '12', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('6bd2dd805ac639f4f3a6', '90000000000000000028', '085925bbd58d31481397', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '9', '8', NULL, NULL, '2026-09-29T14:00:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('77bf7f80523dae79f426', '90000000000000000035', '99ff2b66c25c4713b4c5', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '9', '8', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('7ce2ce671fe7cf56cab7', '90000000000000000034', 'e8183c64c5cff9d097a1', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '9', '8', NULL, NULL, '2026-09-29T13:53:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('8319fc02706e1a6aeacb', '90000000000000000124', 'cf8423f7c7058b111056', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '9', '8', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('88bfca58cccc1b072d21', '90000000000000000130', NULL, '', '运维老王', '', '讲解清晰，对新手非常友好。', 1, 0, '', NULL, '', '9', '12', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('8ae4dae2dbae4457379b', '90000000000000000026', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '9', '10', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('95a1e510dc0be0657b20', '90000000000000000031', NULL, '', '架构师K', '', '思路被打开了，期待作者的下一篇。', 1, 0, '', NULL, '', '9', '10', NULL, NULL, '2026-09-29T13:54:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('97c29a025ebd171c8a52', '90000000000000000128', '807a764fd97d50946bfd', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '9', '8', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('b6751685f15ab70ab247', '90000000000000000123', NULL, '', '前端小李', '', '已经收藏，准备照着实践一遍。', 1, 0, '', NULL, '', '9', '10', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('b7dfbef2f145167e13a4', '90000000000000000125', 'c2bcd6d26ffdb007ace6', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '9', '10', NULL, NULL, '2026-09-29T13:57:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('ba5699c87d6f657cae0e', '90000000000000000101', 'f50516a8d702aa2b622a', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '9', '10', NULL, NULL, '2026-09-29T14:04:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('bee529b34fb9a00a0811', '90000000000000000029', '94386fdcb4cbf99e58d3', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '9', '8', NULL, NULL, '2026-09-29T14:07:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('bf35bb30a15d09f7353f', '90000000000000000122', NULL, '', '产品阿珍', '', '正好遇到类似的问题，受教了。', 1, 0, '', NULL, '', '9', '10', NULL, NULL, '2026-09-29T14:01:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('d083b3493415d8dac3f7', '90000000000000000122', '502b5eff270fc718d65b', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '9', '12', NULL, NULL, '2026-09-29T14:14:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('d56c08a131a8e13da0c6', '90000000000000000030', '8d04799368006aa3f6f5', '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '9', '10', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.151Z'),
  ('fcf19283421bfc6a6fb8', '90000000000000000130', 'b691b12e62b88b194162', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '9', '12', NULL, NULL, '2026-09-29T13:50:20.059Z', '2026-09-29T15:40:34.169Z'),
  ('2bf78fc8eb4f732b8b19', '90000000000000000026', '8171ab5c2e72136b8731', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T14:07:20.059Z', '2026-09-30T15:25:34.045Z'),
  ('38eec648c01eae1f9713', '90000000000000000124', 'a175c6019046b6eb3d5c', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T13:50:20.059Z', '2026-09-30T15:25:34.045Z'),
  ('395508a9cd2be8f38add', '90000000000000000024', 'ec6bd11633632321bd86', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T13:53:20.059Z', '2026-09-30T15:25:34.045Z'),
  ('6e0a1a356a82dcb468ec', '90000000000000000028', '39c13a4b24b671fcdce5', '', '架构师K', '', '排版很舒服，阅读体验很好。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T13:53:20.059Z', '2026-09-30T15:25:34.045Z'),
  ('7ac38f5dd14723440301', '90000000000000000034', '1aca750975dfe454edf4', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T14:07:20.059Z', '2026-09-30T15:25:34.045Z'),
  ('90000000000000000049', '90000000000000000020', NULL, '757594002051563520', '访客甲', '', '期待下一篇进阶内容。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-10T04:00:00.000Z', '2026-09-30T15:25:34.045Z'),
  ('a25027b29e46734c78ba', '90000000000000000133', '4f2292b2ce57d7480f6e', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T14:11:20.059Z', '2026-09-30T15:25:34.045Z'),
  ('caba617010bf50732c08', '90000000000000000029', 'ab9f7045a5981054df31', '', '前端小李', '', '补充一点：注意权限缓存带来的坑。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T14:00:20.059Z', '2026-09-30T15:25:34.045Z'),
  ('ccd30f5d5a80a0879c84', '90000000000000000131', '1ab263a0014f20dc3ded', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T14:00:20.059Z', '2026-09-30T15:25:34.045Z'),
  ('f35806d706cfe9147248', '90000000000000000122', NULL, '', '产品阿珍', '', '请问生产环境里有踩过什么坑吗？', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T14:21:20.059Z', '2026-09-30T15:25:34.045Z'),
  ('f8582953860f7825d979', '90000000000000000027', '4b845239a0964e0e3ce9', '', '运维老王', '', '按文中步骤验证过，确实可行。', 1, 0, '', NULL, '', '15', '18', NULL, '604612615536115712', '2026-09-29T14:04:20.059Z', '2026-09-30T15:25:34.045Z')
ON CONFLICT ("id") DO NOTHING;


COMMIT;
