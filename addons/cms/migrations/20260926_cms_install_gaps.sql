BEGIN;
SET LOCAL search_path TO meadmin;

-- 补齐评论树模型及新增下载、留言实体所需的数据库结构。
ALTER TABLE IF EXISTS aon_cms_comment
  ADD COLUMN IF NOT EXISTS parent_id varchar(20),
  ADD COLUMN IF NOT EXISTS "left" integer,
  ADD COLUMN IF NOT EXISTS "right" integer,
  ADD COLUMN IF NOT EXISTS lock_version varchar(100) NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS aon_cms_comment_tree_idx
  ON aon_cms_comment(article_id, "left", "right");
CREATE INDEX IF NOT EXISTS aon_cms_comment_parent_idx
  ON aon_cms_comment(parent_id);

CREATE TABLE IF NOT EXISTS aon_cms_download (
  id varchar(20) PRIMARY KEY,
  title varchar(200) NOT NULL DEFAULT '',
  slug varchar(120) NOT NULL UNIQUE,
  category varchar(80) NOT NULL DEFAULT '',
  version varchar(50) NOT NULL DEFAULT '',
  summary varchar(1000) NOT NULL DEFAULT '',
  md_content text NOT NULL DEFAULT '',
  cover_url varchar(1000) NOT NULL DEFAULT '',
  file_url varchar(1000) NOT NULL DEFAULT '',
  downloads integer NOT NULL DEFAULT 0 CHECK (downloads >= 0),
  status smallint NOT NULL DEFAULT 1 CHECK (status IN (0,1)),
  order_num smallint NOT NULL DEFAULT 0,
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS aon_cms_download_category_idx
  ON aon_cms_download(category, order_num DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS aon_cms_message (
  id varchar(20) PRIMARY KEY,
  author varchar(80) NOT NULL DEFAULT '',
  contact varchar(120) NOT NULL DEFAULT '',
  content varchar(2000) NOT NULL DEFAULT '',
  reply varchar(2000) NOT NULL DEFAULT '',
  status smallint NOT NULL DEFAULT 0 CHECK (status IN (0,1,2)),
  created_admin_id varchar(20),
  updated_admin_id varchar(20),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS aon_cms_message_status_idx
  ON aon_cms_message(status, created_at DESC);

COMMIT;
