-- Remove duplicate news items, keeping only the most recent one for each URL
DELETE FROM news_items 
WHERE id NOT IN (
  SELECT DISTINCT ON (url) id
  FROM news_items
  ORDER BY url, created_at DESC
);

-- Now add the unique constraint
ALTER TABLE news_items ADD CONSTRAINT news_items_url_unique UNIQUE (url);