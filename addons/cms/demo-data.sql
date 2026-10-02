-- CMS 演示数据增强脚本（修正 slug 前缀为 demo-）
-- 前置条件：已执行 install.sql 与后续 migrations。
-- 本脚本仅更新 slug 以 demo- 开头的演示记录，可重复执行，不清空业务数据。
-- 重点：消除“列表显示评论数、详情却为 0”的不一致——为演示文章写入真实多级评论并校准计数。
BEGIN;
SET LOCAL search_path TO meadmin;

-- 1) 统一封面（复用站内真实图片资源）与更有区分度的统计数字
WITH demo_articles AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY publish_at DESC NULLS LAST, id) AS row_num,
         COUNT(*) OVER () AS total
  FROM aon_cms_article
  WHERE slug LIKE 'demo-%'
)
UPDATE aon_cms_article article
SET cover_url = CASE (demo_articles.row_num - 1) % 3
      WHEN 0 THEN '/index/images/cms/cms-ai-editorial.png'
      WHEN 1 THEN '/index/images/cms/cms-cloud-analytics.png'
      ELSE '/index/images/cms/cms-design-system.png'
    END,
    views = 320 + (demo_articles.total - demo_articles.row_num + 1) * 53,
    likes = 18 + (demo_articles.total - demo_articles.row_num + 1) * 5,
    updated_at = CURRENT_TIMESTAMP
FROM demo_articles
WHERE article.id = demo_articles.id
  -- 仅修正静态/缺失封面，保留已通过文件上传组件上传的真实附件 URL（/api/admin/file/get/...）
  AND (article.cover_url IS NULL OR article.cover_url = '' OR article.cover_url LIKE '/index/images/cms/%');

-- 2) 为每篇演示文章分配贴合主题的标签，使“标签列表页”与卡片归属均有真实数据支撑。
UPDATE aon_cms_article art
SET tag_ids = COALESCE(sub.ids, ARRAY[]::varchar[])
FROM (
  SELECT m.aslug, array_agg(tag.id ORDER BY tag.id)::varchar[] AS ids
  FROM (VALUES
    ('demo-case-01', 'tpl'), ('demo-case-01', 'viz'),
    ('demo-download-01', 'tpl'), ('demo-download-02', 'tpl'),
    ('demo-download-03', 'auth'), ('demo-download-03', 'sec'),
    ('demo-draft-01', 'lowcode'), ('demo-future-01', 'ai'),
    ('demo-gallery-01', 'viz'), ('demo-gallery-01', 'tpl'),
    ('demo-gallery-02', 'viz'), ('demo-gallery-02', 'tpl'),
    ('demo-gallery-03', 'viz'), ('demo-gallery-04', 'cloud'), ('demo-gallery-04', 'viz'),
    ('demo-lesson-01', 'lowcode'), ('demo-lesson-01', 'tpl'),
    ('demo-lesson-02', 'cloud'), ('demo-lesson-02', 'perf'),
    ('demo-lesson-03', 'auth'), ('demo-lesson-03', 'sec'),
    ('demo-lesson-04', 'viz'), ('demo-lesson-04', 'lowcode'),
    ('demo-pending-01', 'lowcode'), ('demo-report-article', 'sec'), ('demo-report-article', 'perf'),
    ('demo-res-01', 'tpl'), ('demo-res-02', 'tpl'), ('demo-res-03', 'auth'),
    ('demo-res-04', 'tpl'), ('demo-res-04', 'lowcode'),
    ('demo-res-05', 'cloud'), ('demo-res-05', 'perf'),
    ('demo-res-06', 'cloud'), ('demo-res-06', 'ai'),
    ('demo-res-07', 'perf'), ('demo-res-07', 'cloud'),
    ('demo-res-08', 'auth'), ('demo-res-08', 'sec'),
    ('demo-res-09', 'perf'), ('demo-res-10', 'tpl'), ('demo-res-10', 'viz'),
    ('demo-res-11', 'viz'), ('demo-res-11', 'tpl'), ('demo-res-12', 'lowcode'), ('demo-res-13', 'lowcode'),
    ('demo-res-14', 'cloud'), ('demo-res-14', 'perf')
  ) AS m(aslug, tslug)
  JOIN aon_cms_tag tag ON tag.slug = m.tslug
  GROUP BY m.aslug
) sub
WHERE art.slug = sub.aslug;

-- 3) 为“尚无任何评论”的演示文章写入真实的多级评论，使列表计数有真实数据支撑。
--    每条根评论带有 1~2 条回复，内容取自贴近技术社区的真实话术，重复执行不会产生重复记录。
DO $$
DECLARE
  art RECORD;
  n_roots INT;
  n_replies INT;
  r INT;
  l INT;
  root_id TEXT;
  prev_id TEXT;
  new_id TEXT;
  roots_arr TEXT[] := ARRAY[
    '这篇内容很实用，感谢作者分享！',
    '已经收藏，准备照着实践一遍。',
    '讲解清晰，对新手非常友好。',
    '正好遇到类似的问题，受教了。',
    '思路被打开了，期待作者的下一篇。'
  ];
  rep_arr TEXT[] := ARRAY[
    '同意，我们项目里也是这么落地的。',
    '补充一点：注意权限缓存带来的坑。',
    '按文中步骤验证过，确实可行。',
    '请问生产环境里有踩过什么坑吗？',
    '排版很舒服，阅读体验很好。'
  ];
  authors_arr TEXT[] := ARRAY['读者A', '前端小李', '运维老王', '产品阿珍', '架构师K'];
BEGIN
  FOR art IN SELECT id, slug FROM aon_cms_article WHERE slug LIKE 'demo-%' ORDER BY publish_at DESC NULLS LAST, id
  LOOP
    IF (SELECT COUNT(*) FROM aon_cms_comment WHERE article_id = art.id) > 0 THEN
      CONTINUE;
    END IF;
    n_roots := 2 + (abs(hashtext(art.slug)) % 4);  -- 2..5 条根评论
    FOR r IN 1..n_roots LOOP
      -- 评论主键与运行时一致：统一使用 20 位数字 ID（雪花位宽），避免十六进制 ID 被接口校验拦下
      root_id := '9000' || lpad(abs(hashtext(art.id || ':root-' || r))::text, 16, '0');
      INSERT INTO aon_cms_comment (id, article_id, parent_id, user_id, author, content, status, report_count, report_reason, created_at, updated_at)
      VALUES (
        root_id, art.id, NULL, '',
        authors_arr[1 + (abs(hashtext(art.slug || r)) % array_length(authors_arr, 1))],
        roots_arr[1 + (abs(hashtext(art.slug || r)) % array_length(roots_arr, 1))],
        1, 0, '', now() + ((r * 7) || ' minutes')::interval, now()
      )
      ON CONFLICT (id) DO NOTHING;
      n_replies := 1 + (abs(hashtext(art.slug || r)) % 2);  -- 1..2 条回复
      prev_id := root_id;
      FOR l IN 1..n_replies LOOP
        new_id := '9000' || lpad(abs(hashtext(art.id || ':root-' || r || ':lv-' || l))::text, 16, '0');
        INSERT INTO aon_cms_comment (id, article_id, parent_id, user_id, author, content, status, report_count, report_reason, created_at, updated_at)
        VALUES (
          new_id, art.id, prev_id, '',
          authors_arr[1 + (abs(hashtext(art.slug || r || l)) % array_length(authors_arr, 1))],
          rep_arr[1 + (abs(hashtext(art.slug || r || l)) % array_length(rep_arr, 1))],
          1, 0, '', now() + ((r * 7 + l * 3) || ' minutes')::interval, now()
        )
        ON CONFLICT (id) DO NOTHING;
        prev_id := new_id;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- 4) 按文章重算嵌套集（left/right），保证多级评论树查询不会串到其它文章
DO $$
DECLARE aid TEXT;
BEGIN
  FOR aid IN
    SELECT DISTINCT article_id
    FROM aon_cms_comment
    WHERE article_id IN (SELECT id FROM aon_cms_article WHERE slug LIKE 'demo-%') AND status = 1
  LOOP
    WITH RECURSIVE tree AS (
      SELECT c.id, c.article_id, c.created_at, ARRAY[c.id]::varchar[] AS path
      FROM aon_cms_comment c
      WHERE c.article_id = aid AND c.parent_id IS NULL AND c.status = 1
      UNION ALL
      SELECT child.id, child.article_id, child.created_at, tree.path || child.id
      FROM aon_cms_comment child
      JOIN tree ON tree.id = child.parent_id AND tree.article_id = child.article_id
      WHERE child.status = 1
    ), numbered AS (
      SELECT tree.*, ROW_NUMBER() OVER (ORDER BY path)::integer AS left_value FROM tree
    ), bounds AS (
      SELECT cur.id, cur.left_value,
             cur.left_value + (COUNT(d.id)::integer * 2) + 1 AS right_value
      FROM numbered cur
      JOIN numbered d ON d.path[1:cardinality(cur.path)] = cur.path
      GROUP BY cur.id, cur.left_value
    )
    UPDATE aon_cms_comment c
    SET "left" = b.left_value, "right" = b.right_value
    FROM bounds b
    WHERE c.id = b.id;
  END LOOP;
END $$;

-- 5) 校准评论计数：列表展示的评论数必须与真实“已通过审核”的评论数完全一致
UPDATE aon_cms_article article
SET comments = (
  SELECT COUNT(*)::integer
  FROM aon_cms_comment c
  WHERE c.article_id = article.id AND c.status = 1
)
WHERE article.slug LIKE 'demo-%';

COMMIT;
