BEGIN;
SET LOCAL search_path TO meadmin;

ALTER TABLE aon_cms_article
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS likes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments integer NOT NULL DEFAULT 0;

UPDATE aon_cms_article article
SET comments = metrics.count
FROM (
  SELECT article_id, COUNT(*)::integer AS count
  FROM aon_cms_comment
  WHERE status = 1
  GROUP BY article_id
) metrics
WHERE article.id = metrics.article_id;

COMMIT;
