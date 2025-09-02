-- Add source_id foreign key to news_items table
ALTER TABLE news_items ADD COLUMN source_id UUID REFERENCES news_sources(id);

-- Create an index for better performance
CREATE INDEX idx_news_items_source_id ON news_items(source_id);

-- Update existing news_items to map source names to source_id
-- This maps the text source field to the corresponding news_sources id
UPDATE news_items 
SET source_id = news_sources.id
FROM news_sources 
WHERE news_items.source = news_sources.name;

-- For any news_items that don't have a matching source, create a default entry
-- First, insert a default "Unknown Source" if it doesn't exist
INSERT INTO news_sources (name, category, url, rss_feed_url, target_column)
SELECT 'Unknown Source', 'General', 'https://example.com', 'https://example.com/rss', 'news'
WHERE NOT EXISTS (SELECT 1 FROM news_sources WHERE name = 'Unknown Source');

-- Update any remaining null source_id entries to point to Unknown Source
UPDATE news_items 
SET source_id = (SELECT id FROM news_sources WHERE name = 'Unknown Source')
WHERE source_id IS NULL;

-- Make source_id NOT NULL now that all records have been updated
ALTER TABLE news_items ALTER COLUMN source_id SET NOT NULL;