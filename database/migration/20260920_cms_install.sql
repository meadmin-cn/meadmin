-- CMS 表结构与后台权限菜单迁移（不含演示数据）。
-- 已合并全部历史迁移，演示数据见 addons/cms/install.sql（安装时自动携带）。
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

COMMIT;
