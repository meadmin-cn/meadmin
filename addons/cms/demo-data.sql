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

-- 为演示文章补充可审核的多级评论和分页数据，重复执行不会产生重复记录。
-- 每次生成 4 个根评论，每个根评论包含 5 层回复；前端 pageSize=3 时可直接看到分页。
WITH demo_article AS (
  SELECT id FROM aon_cms_article WHERE slug = 'cms-demo-lesson-01'
), demo_roots AS (
  SELECT demo_article.id AS article_id, n,
         LEFT(md5(demo_article.id || ':demo-root-' || n), 20) AS id
  FROM demo_article CROSS JOIN generate_series(1, 4) AS numbers(n)
), inserted_roots AS (
  INSERT INTO aon_cms_comment (id, article_id, parent_id, user_id, author, content, status, report_count, report_reason, created_at, updated_at)
  SELECT id, article_id, NULL, '', '演示用户' || n,
         '分页演示根评论 #' || n || '：这是第 ' || n || ' 条根评论，用于观察评论分页效果。',
         1, 0, '', CURRENT_TIMESTAMP + (n || ' seconds')::interval, CURRENT_TIMESTAMP + (n || ' seconds')::interval
  FROM demo_roots
  ON CONFLICT (id) DO NOTHING
  RETURNING id
), levels AS (
  SELECT demo_article.id AS article_id, root.n, root.id AS root_id, level,
         LEFT(md5(demo_article.id || ':demo-root-' || root.n || '-level-' || level), 20) AS id,
         CASE level
           WHEN 1 THEN '内容编辑'
           WHEN 2 THEN '产品体验官'
           WHEN 3 THEN '前端观察者'
           WHEN 4 THEN 'CMS 维护者'
           ELSE '演示管理员'
         END AS author
  FROM demo_article
  CROSS JOIN generate_series(1, 4) AS root(n)
  CROSS JOIN generate_series(1, 5) AS level
  WHERE level > 0
), inserted_levels AS (
  INSERT INTO aon_cms_comment (id, article_id, parent_id, user_id, author, content, status, report_count, report_reason, created_at, updated_at)
  SELECT current.id, current.article_id,
         CASE WHEN current.level = 1 THEN current.root_id ELSE previous.id END,
         '', current.author,
         '多级评论演示：第 ' || current.level || ' 层回复，根评论 #' || current.n || '。',
         1, 0, '', CURRENT_TIMESTAMP + ((current.n * 10 + current.level) || ' seconds')::interval,
         CURRENT_TIMESTAMP + ((current.n * 10 + current.level) || ' seconds')::interval
  FROM levels current
  LEFT JOIN levels previous ON previous.article_id = current.article_id
    AND previous.n = current.n AND previous.level = current.level - 1
  ON CONFLICT (id) DO NOTHING
  RETURNING id
)
SELECT 1;

-- 重新按 parent_id 计算嵌套集边界，保证多级树查询不会串到其他根评论。
WITH RECURSIVE tree AS (
  SELECT comment.id, comment.article_id, comment.created_at, ARRAY[comment.id]::varchar[] AS path
  FROM aon_cms_comment comment
  WHERE comment.article_id = (SELECT id FROM aon_cms_article WHERE slug = 'cms-demo-lesson-01')
    AND comment.parent_id IS NULL AND comment.status = 1
  UNION ALL
  SELECT child.id, child.article_id, child.created_at, tree.path || child.id
  FROM aon_cms_comment child
  JOIN tree ON tree.id = child.parent_id AND tree.article_id = child.article_id
  WHERE child.status = 1
), numbered AS (
  SELECT tree.*, ROW_NUMBER() OVER (ORDER BY path)::integer AS left_value
  FROM tree
), bounds AS (
  SELECT current.id, current.left_value,
         current.left_value + (COUNT(descendant.id)::integer * 2) + 1 AS right_value
  FROM numbered current
  JOIN numbered descendant ON descendant.article_id = current.article_id
    AND descendant.path[1:cardinality(current.path)] = current.path
  GROUP BY current.id, current.left_value
)
UPDATE aon_cms_comment comment
SET "left" = bounds.left_value, "right" = bounds.right_value
FROM bounds
WHERE comment.id = bounds.id;

UPDATE aon_cms_article article
SET comments = (SELECT COUNT(*)::integer FROM aon_cms_comment comment WHERE comment.article_id = article.id AND comment.status = 1)
WHERE article.slug = 'cms-demo-lesson-01';

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
