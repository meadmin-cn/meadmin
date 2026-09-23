-- ============================================
-- CMS 插件 - 软删除功能数据库迁移
-- ============================================
-- 执行时间：2026-09-21
-- 功能：为所有 CMS 表添加 deleted_at 字段实现回收站功能
-- 注意：执行前请备份数据库
-- ============================================

-- 1. 为文章表添加软删除字段
ALTER TABLE aon_cms_article 
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
COMMENT '删除时间，NULL 表示未删除';

-- 2. 为单页表添加软删除字段
ALTER TABLE aon_cms_page 
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
COMMENT '删除时间，NULL 表示未删除';

-- 3. 为评论表添加软删除字段
ALTER TABLE aon_cms_comment 
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
COMMENT '删除时间，NULL 表示未删除';

-- 4. 为标签表添加软删除字段
ALTER TABLE aon_cms_tag 
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
COMMENT '删除时间，NULL 表示未删除';

-- 5. 为专题表添加软删除字段
ALTER TABLE aon_cms_topic 
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
COMMENT '删除时间，NULL 表示未删除';

-- 6. 为区块表添加软删除字段
ALTER TABLE aon_cms_block 
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
COMMENT '删除时间，NULL 表示未删除';

-- 7. 为栏目表添加软删除字段
ALTER TABLE aon_cms_category 
ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
COMMENT '删除时间，NULL 表示未删除';

-- ============================================
-- 性能优化：为 deleted_at 字段创建索引
-- ============================================
-- 原因：回收站查询需要过滤 deleted_at IS NOT NULL
--       正常列表查询需要过滤 deleted_at IS NULL

CREATE INDEX idx_cms_article_deleted_at ON aon_cms_article(deleted_at);
CREATE INDEX idx_cms_page_deleted_at ON aon_cms_page(deleted_at);
CREATE INDEX idx_cms_comment_deleted_at ON aon_cms_comment(deleted_at);
CREATE INDEX idx_cms_tag_deleted_at ON aon_cms_tag(deleted_at);
CREATE INDEX idx_cms_topic_deleted_at ON aon_cms_topic(deleted_at);
CREATE INDEX idx_cms_block_deleted_at ON aon_cms_block(deleted_at);
CREATE INDEX idx_cms_category_deleted_at ON aon_cms_category(deleted_at);

-- ============================================
-- 复合索引优化：管理员数据隔离 + 软删除
-- ============================================
-- 原因：查询条件经常同时包含 created_admin_id 和 deleted_at
--       复合索引可显著提升查询性能

CREATE INDEX idx_cms_article_admin_deleted ON aon_cms_article(created_admin_id, deleted_at);
CREATE INDEX idx_cms_page_admin_deleted ON aon_cms_page(created_admin_id, deleted_at);
CREATE INDEX idx_cms_comment_admin_deleted ON aon_cms_comment(created_admin_id, deleted_at);
CREATE INDEX idx_cms_tag_admin_deleted ON aon_cms_tag(created_admin_id, deleted_at);
CREATE INDEX idx_cms_topic_admin_deleted ON aon_cms_topic(created_admin_id, deleted_at);
CREATE INDEX idx_cms_block_admin_deleted ON aon_cms_block(created_admin_id, deleted_at);
CREATE INDEX idx_cms_category_admin_deleted ON aon_cms_category(created_admin_id, deleted_at);

-- ============================================
-- 验证迁移结果
-- ============================================
-- 执行以下查询检查字段是否添加成功

-- 检查所有表的 deleted_at 字段
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name LIKE 'aon_cms_%'
  AND column_name = 'deleted_at'
ORDER BY table_name;

-- 检查索引是否创建成功
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename LIKE 'aon_cms_%'
  AND indexname LIKE '%deleted%'
ORDER BY tablename, indexname;

-- ============================================
-- 回滚脚本（如需撤销迁移）
-- ============================================
/*
-- 删除复合索引
DROP INDEX IF EXISTS idx_cms_article_admin_deleted;
DROP INDEX IF EXISTS idx_cms_page_admin_deleted;
DROP INDEX IF EXISTS idx_cms_comment_admin_deleted;
DROP INDEX IF EXISTS idx_cms_tag_admin_deleted;
DROP INDEX IF EXISTS idx_cms_topic_admin_deleted;
DROP INDEX IF EXISTS idx_cms_block_admin_deleted;
DROP INDEX IF EXISTS idx_cms_category_admin_deleted;

-- 删除单字段索引
DROP INDEX IF EXISTS idx_cms_article_deleted_at;
DROP INDEX IF EXISTS idx_cms_page_deleted_at;
DROP INDEX IF EXISTS idx_cms_comment_deleted_at;
DROP INDEX IF EXISTS idx_cms_tag_deleted_at;
DROP INDEX IF EXISTS idx_cms_topic_deleted_at;
DROP INDEX IF EXISTS idx_cms_block_deleted_at;
DROP INDEX IF EXISTS idx_cms_category_deleted_at;

-- 删除 deleted_at 字段
ALTER TABLE aon_cms_article DROP COLUMN deleted_at;
ALTER TABLE aon_cms_page DROP COLUMN deleted_at;
ALTER TABLE aon_cms_comment DROP COLUMN deleted_at;
ALTER TABLE aon_cms_tag DROP COLUMN deleted_at;
ALTER TABLE aon_cms_topic DROP COLUMN deleted_at;
ALTER TABLE aon_cms_block DROP COLUMN deleted_at;
ALTER TABLE aon_cms_category DROP COLUMN deleted_at;
*/

-- ============================================
-- 数据清理计划（可选）
-- ============================================
-- 建议定期清理回收站中超过 30 天的软删除记录

/*
-- 创建定期清理函数
CREATE OR REPLACE FUNCTION cleanup_cms_recycle_bin(days_ago INTEGER DEFAULT 30)
RETURNS TABLE(table_name TEXT, deleted_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH cleanup_article AS (
    DELETE FROM aon_cms_article 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '1 day' * days_ago
    RETURNING 1
  ),
  cleanup_page AS (
    DELETE FROM aon_cms_page 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '1 day' * days_ago
    RETURNING 1
  ),
  cleanup_comment AS (
    DELETE FROM aon_cms_comment 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '1 day' * days_ago
    RETURNING 1
  ),
  cleanup_tag AS (
    DELETE FROM aon_cms_tag 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '1 day' * days_ago
    RETURNING 1
  ),
  cleanup_topic AS (
    DELETE FROM aon_cms_topic 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '1 day' * days_ago
    RETURNING 1
  ),
  cleanup_block AS (
    DELETE FROM aon_cms_block 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '1 day' * days_ago
    RETURNING 1
  ),
  cleanup_category AS (
    DELETE FROM aon_cms_category 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '1 day' * days_ago
    RETURNING 1
  )
  SELECT 'aon_cms_article'::TEXT, COUNT(*)::BIGINT FROM cleanup_article
  UNION ALL SELECT 'aon_cms_page'::TEXT, COUNT(*)::BIGINT FROM cleanup_page
  UNION ALL SELECT 'aon_cms_comment'::TEXT, COUNT(*)::BIGINT FROM cleanup_comment
  UNION ALL SELECT 'aon_cms_tag'::TEXT, COUNT(*)::BIGINT FROM cleanup_tag
  UNION ALL SELECT 'aon_cms_topic'::TEXT, COUNT(*)::BIGINT FROM cleanup_topic
  UNION ALL SELECT 'aon_cms_block'::TEXT, COUNT(*)::BIGINT FROM cleanup_block
  UNION ALL SELECT 'aon_cms_category'::TEXT, COUNT(*)::BIGINT FROM cleanup_category;
END;
$$ LANGUAGE plpgsql;

-- 手动执行清理（删除 30 天前的记录）
-- SELECT * FROM cleanup_cms_recycle_bin(30);

-- 创建定时任务（每周执行一次）
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-cms-recycle-bin', '0 2 * * 0', 'SELECT cleanup_cms_recycle_bin(30)');
*/

-- ============================================
-- 迁移完成
-- ============================================
-- 执行完成后请：
-- 1. 检查验证查询结果
-- 2. 重启 meadmin 服务
-- 3. 测试回收站功能和批量操作
-- 4. 备份更新后的数据库结构
-- ============================================
