-- CMS 评论登录用户身份快照，不创建数据库外键，关联由服务层维护。
ALTER TABLE IF EXISTS aon_cms_comment
  ADD COLUMN IF NOT EXISTS user_id VARCHAR(20) NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS author_avatar VARCHAR(1000) NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_aon_cms_comment_user_id
  ON aon_cms_comment (user_id, created_at DESC);
