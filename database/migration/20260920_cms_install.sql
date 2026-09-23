-- 待授权执行。包含新 CMS 表及旧 system_menu 的新增记录；不分配角色权限。
BEGIN;
SET LOCAL search_path TO meadmin;

CREATE TABLE IF NOT EXISTS aon_cms_category (
  id varchar(20) PRIMARY KEY,
  title varchar(100) NOT NULL DEFAULT '',
  slug varchar(120) NOT NULL DEFAULT '' UNIQUE,
  status smallint NOT NULL DEFAULT 1 CHECK (status IN (0,1)),
  order_num smallint NOT NULL DEFAULT 0,
  parent_id varchar(100),
  "left" bigint,
  "right" bigint,
  lock_version varchar(100) NOT NULL DEFAULT '',
  CHECK (parent_id IS DISTINCT FROM id),
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS aon_cms_category_created_idx ON aon_cms_category(created_at);

CREATE TABLE IF NOT EXISTS aon_cms_tag (
  id varchar(20) PRIMARY KEY,
  title varchar(100) NOT NULL DEFAULT '',
  slug varchar(120) NOT NULL DEFAULT '' UNIQUE,
  status smallint NOT NULL DEFAULT 1 CHECK (status IN (0,1)),
  order_num smallint NOT NULL DEFAULT 0,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS aon_cms_tag_created_idx ON aon_cms_tag(created_at);

CREATE TABLE IF NOT EXISTS aon_cms_topic (
  id varchar(20) PRIMARY KEY,
  title varchar(200) NOT NULL DEFAULT '',
  slug varchar(120) NOT NULL DEFAULT '' UNIQUE,
  summary varchar(1000) NOT NULL DEFAULT '',
  md_content text NOT NULL DEFAULT '',
  cover_url varchar(1000) NOT NULL DEFAULT '',
  status smallint NOT NULL DEFAULT 1 CHECK (status IN (0,1)),
  order_num smallint NOT NULL DEFAULT 0,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS aon_cms_topic_created_idx ON aon_cms_topic(created_at);

CREATE TABLE IF NOT EXISTS aon_cms_article (
  id varchar(20) PRIMARY KEY,
  title varchar(200) NOT NULL DEFAULT '',
  slug varchar(120) NOT NULL DEFAULT '' UNIQUE,
  summary varchar(1000) NOT NULL DEFAULT '',
  md_content text NOT NULL DEFAULT '',
  cover_url varchar(1000) NOT NULL DEFAULT '',
  seo_title varchar(200) NOT NULL DEFAULT '',
  seo_keywords varchar(200) NOT NULL DEFAULT '',
  seo_description varchar(500) NOT NULL DEFAULT '',
  status smallint NOT NULL DEFAULT 0 CHECK (status IN (0,1,2,3,4)),
  publish_at timestamptz,
  order_num smallint NOT NULL DEFAULT 0,
  category_id varchar(20),
  topic_id varchar(20),
  tag_ids varchar(20)[] NOT NULL DEFAULT '{}',
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  likes integer NOT NULL DEFAULT 0 CHECK (likes >= 0),
  comments integer NOT NULL DEFAULT 0 CHECK (comments >= 0),
  order_enabled boolean NOT NULL DEFAULT false,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status <> 2 OR publish_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS aon_cms_article_created_idx ON aon_cms_article(created_at);
CREATE INDEX IF NOT EXISTS aon_cms_article_publish_idx ON aon_cms_article(status, publish_at);

CREATE TABLE IF NOT EXISTS aon_cms_page (
  id varchar(20) PRIMARY KEY,
  title varchar(200) NOT NULL DEFAULT '',
  slug varchar(120) NOT NULL DEFAULT '' UNIQUE,
  summary varchar(1000) NOT NULL DEFAULT '',
  md_content text NOT NULL DEFAULT '',
  cover_url varchar(1000) NOT NULL DEFAULT '',
  seo_title varchar(200) NOT NULL DEFAULT '',
  seo_keywords varchar(200) NOT NULL DEFAULT '',
  seo_description varchar(500) NOT NULL DEFAULT '',
  status smallint NOT NULL DEFAULT 0 CHECK (status IN (0,1,2,3,4)),
  publish_at timestamptz,
  order_num smallint NOT NULL DEFAULT 0,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status <> 2 OR publish_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS aon_cms_page_created_idx ON aon_cms_page(created_at);
CREATE INDEX IF NOT EXISTS aon_cms_page_publish_idx ON aon_cms_page(status, publish_at);

CREATE TABLE IF NOT EXISTS aon_cms_block (
  id varchar(20) PRIMARY KEY,
  title varchar(200) NOT NULL DEFAULT '',
  slug varchar(120) NOT NULL DEFAULT '' UNIQUE,
  position varchar(100) NOT NULL DEFAULT '',
  kind smallint NOT NULL DEFAULT 1 CHECK (kind IN (1,2,3)),
  md_content text NOT NULL DEFAULT '',
  cover_url varchar(1000) NOT NULL DEFAULT '',
  link varchar(1000) NOT NULL DEFAULT '',
  status smallint NOT NULL DEFAULT 1 CHECK (status IN (0,1)),
  start_at timestamptz,
  end_at timestamptz,
  order_num smallint NOT NULL DEFAULT 0,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (start_at IS NULL OR end_at IS NULL OR start_at < end_at)
);
CREATE INDEX IF NOT EXISTS aon_cms_block_created_idx ON aon_cms_block(created_at);

CREATE TABLE IF NOT EXISTS aon_cms_comment (
  id varchar(20) PRIMARY KEY,
  article_id varchar(20) NOT NULL,
  user_id varchar(20) NOT NULL DEFAULT '',
  author varchar(80) NOT NULL DEFAULT '',
  author_avatar varchar(1000) NOT NULL DEFAULT '',
  content varchar(2000) NOT NULL DEFAULT '',
  status smallint NOT NULL DEFAULT 0 CHECK (status IN (0,1,2)),
  report_count integer NOT NULL DEFAULT 0 CHECK (report_count >= 0),
  report_reason varchar(500) NOT NULL DEFAULT '',
  reported_at timestamptz,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS aon_cms_comment_created_idx ON aon_cms_comment(created_at);

CREATE TABLE IF NOT EXISTS aon_cms_order (
  id varchar(20) PRIMARY KEY,
  order_no varchar(32) NOT NULL UNIQUE,
  article_id varchar(20) NOT NULL,
  user_id varchar(20),
  contact_name varchar(80) NOT NULL DEFAULT '',
  contact_phone varchar(30) NOT NULL DEFAULT '',
  shipping_address varchar(500) NOT NULL DEFAULT '',
  item_name varchar(160) NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status smallint NOT NULL DEFAULT 0 CHECK (status IN (0,1,2,3)),
  payment_status smallint NOT NULL DEFAULT 0 CHECK (payment_status IN (0,1,2)),
  remark varchar(500) NOT NULL DEFAULT '',
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS aon_cms_order_created_idx ON aon_cms_order(created_at);
CREATE INDEX IF NOT EXISTS aon_cms_order_status_idx ON aon_cms_order(status, payment_status);
CREATE INDEX IF NOT EXISTS aon_cms_order_article_idx ON aon_cms_order(article_id);
CREATE INDEX IF NOT EXISTS aon_cms_order_user_idx ON aon_cms_order(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS aon_cms_article_category_idx ON aon_cms_article(category_id);
CREATE INDEX IF NOT EXISTS aon_cms_article_topic_idx ON aon_cms_article(topic_id);
CREATE INDEX IF NOT EXISTS aon_cms_article_tags_idx ON aon_cms_article USING gin(tag_ids);
CREATE INDEX IF NOT EXISTS aon_cms_comment_article_idx ON aon_cms_comment(article_id, status);

LOCK TABLE system_menu IN SHARE ROW EXCLUSIVE MODE;
DO $$
DECLARE base bigint; existing integer;
BEGIN
  SELECT count(*) INTO existing FROM system_menu WHERE rule IN ('addons_cms','aon_cms_category','aon_cms_category_list','aon_cms_category_info','aon_cms_category_add','aon_cms_category_edit','aon_cms_category_del','aon_cms_tag','aon_cms_tag_list','aon_cms_tag_info','aon_cms_tag_add','aon_cms_tag_edit','aon_cms_tag_del','aon_cms_topic','aon_cms_topic_list','aon_cms_topic_info','aon_cms_topic_add','aon_cms_topic_edit','aon_cms_topic_del','aon_cms_article','aon_cms_article_list','aon_cms_article_info','aon_cms_article_add','aon_cms_article_edit','aon_cms_article_del','aon_cms_article_review','aon_cms_page','aon_cms_page_list','aon_cms_page_info','aon_cms_page_add','aon_cms_page_edit','aon_cms_page_del','aon_cms_page_review','aon_cms_block','aon_cms_block_list','aon_cms_block_info','aon_cms_block_add','aon_cms_block_edit','aon_cms_block_del','aon_cms_comment','aon_cms_comment_list','aon_cms_comment_info','aon_cms_comment_add','aon_cms_comment_edit','aon_cms_comment_del','aon_cms_comment_review','aon_cms_statistics','aon_cms_statistics_list');
  IF existing = 48 THEN RETURN; END IF;
  IF existing <> 0 THEN RAISE EXCEPTION 'CMS 菜单不完整，请人工检查后重试'; END IF;
  SELECT COALESCE(max("right"), 0) INTO base FROM system_menu;
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000000','CMS',1,1,'addons_cms',50,'/addons/cms',0,'',0,0,'',0,1,1,NULL,base+1,base+96,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000001','栏目',2,1,'aon_cms_category',50,'/addons/cms/category',0,'addons/cms/views/category/index',0,0,'',0,0,1,'820260920000000000',base+2,base+13,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000002','列表',3,1,'aon_cms_category_list',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+3,base+4,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000003','详情',3,1,'aon_cms_category_info',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+5,base+6,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000004','新增',3,1,'aon_cms_category_add',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+7,base+8,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000005','编辑',3,1,'aon_cms_category_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+9,base+10,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000006','删除',3,1,'aon_cms_category_del',50,'',0,'',0,0,'',0,0,1,'820260920000000001',base+11,base+12,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000007','标签',2,1,'aon_cms_tag',50,'/addons/cms/tag',0,'addons/cms/views/tag/index',0,0,'',0,0,1,'820260920000000000',base+14,base+25,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000008','列表',3,1,'aon_cms_tag_list',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+15,base+16,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000009','详情',3,1,'aon_cms_tag_info',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+17,base+18,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000010','新增',3,1,'aon_cms_tag_add',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+19,base+20,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000011','编辑',3,1,'aon_cms_tag_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+21,base+22,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000012','删除',3,1,'aon_cms_tag_del',50,'',0,'',0,0,'',0,0,1,'820260920000000007',base+23,base+24,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000013','专题',2,1,'aon_cms_topic',50,'/addons/cms/topic',0,'addons/cms/views/topic/index',0,0,'',0,0,1,'820260920000000000',base+26,base+37,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000014','列表',3,1,'aon_cms_topic_list',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+27,base+28,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000015','详情',3,1,'aon_cms_topic_info',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+29,base+30,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000016','新增',3,1,'aon_cms_topic_add',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+31,base+32,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000017','编辑',3,1,'aon_cms_topic_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+33,base+34,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000018','删除',3,1,'aon_cms_topic_del',50,'',0,'',0,0,'',0,0,1,'820260920000000013',base+35,base+36,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000019','文章',2,1,'aon_cms_article',50,'/addons/cms/article',0,'addons/cms/views/article/index',0,0,'',0,0,1,'820260920000000000',base+38,base+51,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
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
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000033','区块',2,1,'aon_cms_block',50,'/addons/cms/block',0,'addons/cms/views/block/index',0,0,'',0,0,1,'820260920000000000',base+66,base+77,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000034','列表',3,1,'aon_cms_block_list',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+67,base+68,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000035','详情',3,1,'aon_cms_block_info',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+69,base+70,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000036','新增',3,1,'aon_cms_block_add',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+71,base+72,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000037','编辑',3,1,'aon_cms_block_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+73,base+74,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000038','删除',3,1,'aon_cms_block_del',50,'',0,'',0,0,'',0,0,1,'820260920000000033',base+75,base+76,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000039','评论',2,1,'aon_cms_comment',50,'/addons/cms/comment',0,'addons/cms/views/comment/index',0,0,'',0,0,1,'820260920000000000',base+78,base+91,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000040','列表',3,1,'aon_cms_comment_list',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+79,base+80,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000041','详情',3,1,'aon_cms_comment_info',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+81,base+82,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000042','新增',3,1,'aon_cms_comment_add',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+83,base+84,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000043','编辑',3,1,'aon_cms_comment_edit',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+85,base+86,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000044','删除',3,1,'aon_cms_comment_del',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+87,base+88,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000045','审核',3,1,'aon_cms_comment_review',50,'',0,'',0,0,'',0,0,1,'820260920000000039',base+89,base+90,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000046','统计',2,1,'aon_cms_statistics',50,'/addons/cms/statistics',0,'addons/cms/views/statistics/index',0,0,'',0,0,1,'820260920000000000',base+92,base+95,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
  INSERT INTO system_menu(id,title,menu_type,status,rule,order_num,path,is_link,component,hide_menu,cache,icon,affix,always_show,breadcrumb,parent_id,"left","right",lock_version,created_at,updated_at) VALUES ('820260920000000047','列表',3,1,'aon_cms_statistics_list',50,'',0,'',0,0,'',0,0,1,'820260920000000046',base+93,base+94,'',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
END $$;
COMMIT;
