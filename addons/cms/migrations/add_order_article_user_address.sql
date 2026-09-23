BEGIN;

ALTER TABLE aon_cms_order ADD COLUMN IF NOT EXISTS article_id varchar(20);
ALTER TABLE aon_cms_order ADD COLUMN IF NOT EXISTS user_id varchar(20);
ALTER TABLE aon_cms_order ADD COLUMN IF NOT EXISTS shipping_address varchar(500) NOT NULL DEFAULT '';

UPDATE aon_cms_order o
SET article_id = a.id
FROM aon_cms_article a
WHERE o.article_id IS NULL AND o.item_name = a.title;

CREATE INDEX IF NOT EXISTS aon_cms_order_article_idx ON aon_cms_order(article_id);
CREATE INDEX IF NOT EXISTS aon_cms_order_user_idx ON aon_cms_order(user_id) WHERE user_id IS NOT NULL;

COMMIT;
