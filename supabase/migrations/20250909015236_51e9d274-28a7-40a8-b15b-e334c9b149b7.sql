-- Remove Common Sense (Substack) from currents feeds
UPDATE news_sources SET target_column = 'news' WHERE name = 'Common Sense (Substack)';