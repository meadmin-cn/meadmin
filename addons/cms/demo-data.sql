-- CMS 中文演示数据增强脚本
-- 前置条件：已执行 install.sql 和 migrations/add_article_metrics.sql。
-- 本脚本仅更新 slug 以 cms-demo- 开头的演示记录，可重复执行，不清空业务数据。
BEGIN;
SET LOCAL search_path TO meadmin;

-- 为全部演示文章配置统一风格的本地封面和有区分度的统计数据。
WITH demo_articles AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY publish_at DESC NULLS LAST, id) AS row_num,
         COUNT(*) OVER () AS total
  FROM aon_cms_article
  WHERE slug LIKE 'cms-demo-lesson-%'
)
UPDATE aon_cms_article article
SET cover_url = CASE (demo_articles.row_num - 1) % 3
      WHEN 0 THEN '/index/images/cms/cms-ai-editorial.png'
      WHEN 1 THEN '/index/images/cms/cms-cloud-analytics.png'
      ELSE '/index/images/cms/cms-design-system.png'
    END,
    views = 420 + (demo_articles.total - demo_articles.row_num + 1) * 96,
    likes = 24 + (demo_articles.total - demo_articles.row_num + 1) * 7,
    updated_at = CURRENT_TIMESTAMP
FROM demo_articles
WHERE article.id = demo_articles.id;

-- 评论数始终以已审核评论为准，避免演示数字与真实记录不一致。
UPDATE aon_cms_article article
SET comments = (
  SELECT COUNT(*)::integer
  FROM aon_cms_comment comment
  WHERE comment.article_id = article.id
    AND comment.status = 1
)
WHERE article.slug LIKE 'cms-demo-%';

-- 为演示文章补充可审核的主评论和回复，重复执行不会产生重复记录。
INSERT INTO aon_cms_comment (id, article_id, parent_id, author, content, status, created_at, updated_at)
SELECT LEFT(md5(article.id || ':demo-comment'), 20), article.id, NULL, '林晓', '这篇内容很实用，示例结构清晰，正好可以拿来参考。', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM aon_cms_article article
WHERE article.slug = 'cms-demo-lesson-01'
  AND NOT EXISTS (SELECT 1 FROM aon_cms_comment comment WHERE comment.id = LEFT(md5(article.id || ':demo-comment'), 20));
INSERT INTO aon_cms_comment (id, article_id, parent_id, author, content, status, created_at, updated_at)
SELECT LEFT(md5(article.id || ':demo-reply'), 20), article.id, LEFT(md5(article.id || ':demo-comment'), 20), 'CMS 管理员', '感谢反馈，后续还会继续补充更多案例。', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM aon_cms_article article
WHERE article.slug = 'cms-demo-lesson-01'
  AND NOT EXISTS (SELECT 1 FROM aon_cms_comment comment WHERE comment.id = LEFT(md5(article.id || ':demo-reply'), 20));

-- 更新专题封面。
UPDATE aon_cms_topic
SET cover_url = CASE slug
  WHEN 'cms-demo-handbook' THEN '/index/images/cms/cms-ai-editorial.png'
  WHEN 'cms-demo-readable' THEN '/index/images/cms/cms-design-system.png'
  ELSE cover_url
END,
updated_at = CURRENT_TIMESTAMP
WHERE slug IN ('cms-demo-handbook', 'cms-demo-readable');

-- 将首页轮播切换为本地素材。kind=2 表示轮播图。
UPDATE aon_cms_block
SET cover_url = '/index/images/cms/cms-ai-editorial.png',
    kind = 2,
    updated_at = CURRENT_TIMESTAMP
WHERE slug = 'cms-demo-hero';

-- 如果安装数据使用其他 cms-demo 轮播 slug，则按排序轮换三张本地素材。
WITH demo_blocks AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY order_num DESC, id) AS row_num
  FROM aon_cms_block
  WHERE position = 'home'
    AND kind = 2
    AND slug LIKE 'cms-demo-%'
)
UPDATE aon_cms_block block
SET cover_url = CASE (demo_blocks.row_num - 1) % 3
  WHEN 0 THEN '/index/images/cms/cms-ai-editorial.png'
  WHEN 1 THEN '/index/images/cms/cms-design-system.png'
  ELSE '/index/images/cms/cms-cloud-analytics.png'
END,
updated_at = CURRENT_TIMESTAMP
FROM demo_blocks
WHERE block.id = demo_blocks.id;

COMMIT;
