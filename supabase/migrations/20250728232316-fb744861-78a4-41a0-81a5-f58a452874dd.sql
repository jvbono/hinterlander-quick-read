-- Add target_column to news_sources table to organize feeds by column
ALTER TABLE news_sources ADD COLUMN target_column TEXT;

-- Update existing sources with appropriate column assignments
-- News column: Traditional news sources
UPDATE news_sources SET target_column = 'news' WHERE name IN (
  'CBC News', 'Globe and Mail', 'CTV News', 'National Post', 'Toronto Star',
  'Vancouver Sun', 'Calgary Herald', 'Ottawa Citizen', 'Montreal Gazette',
  'Edmonton Journal', 'Winnipeg Free Press', 'Halifax Chronicle Herald',
  'Regina Leader-Post', 'Saskatoon StarPhoenix', 'Times Colonist',
  'The Guardian PE', 'Telegraph-Journal', 'The Telegram', 'Northern News Services',
  'Yukon News', 'Nunatsiaq News', 'iPolitics', 'Hill Times',
  'Policy Options', 'Macleans', 'Canadian Press'
);

-- Opinion column: Editorial and opinion feeds
UPDATE news_sources SET target_column = 'opinion' WHERE name IN (
  'CBC Opinion', 'Globe and Mail Opinion', 'National Post Opinion', 'Toronto Star Opinion'
);

-- Currents column: Substacks, podcasts, independent analysis
UPDATE news_sources SET target_column = 'currents' WHERE name IN (
  'The Line (Substack)', 'Canadaland Podcast', 'The Hub (Substack)',
  'Common Sense (Substack)', 'The Dispatch (Substack)',
  'The Line', 'Canadaland', 'The Hub', 'Blacklocks Reporter',
  'True North', 'Western Standard', 'The Tyee', 'National Observer',
  'The Walrus', 'Rabble.ca', 'The Afro News'
);

-- Set default for any remaining sources
UPDATE news_sources SET target_column = 'news' WHERE target_column IS NULL;