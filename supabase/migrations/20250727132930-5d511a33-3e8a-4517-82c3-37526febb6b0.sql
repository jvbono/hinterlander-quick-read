-- Add unique constraint on url field to prevent duplicates and enable ON CONFLICT
ALTER TABLE news_items ADD CONSTRAINT news_items_url_unique UNIQUE (url);