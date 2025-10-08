-- Populate sources table with initial Canadian news sources
INSERT INTO sources (name, site_url, rss_url, default_target, tags) VALUES
  ('CBC News - Canada', 'https://www.cbc.ca', 'https://www.cbc.ca/webfeed/rss/rss-canada', 'news', ARRAY['mainstream', 'national']),
  ('CBC News - British Columbia', 'https://www.cbc.ca', 'https://www.cbc.ca/webfeed/rss/rss-canada-britishcolumbia', 'news', ARRAY['mainstream', 'bc', 'regional']),
  ('CBC News - Toronto', 'https://www.cbc.ca', 'https://www.cbc.ca/webfeed/rss/rss-canada-toronto', 'news', ARRAY['mainstream', 'ontario', 'regional']),
  ('CBC News - Montreal', 'https://www.cbc.ca', 'https://www.cbc.ca/webfeed/rss/rss-canada-montreal', 'news', ARRAY['mainstream', 'qc', 'regional']),
  ('The Globe and Mail - Canada', 'https://www.theglobeandmail.com', 'https://www.theglobeandmail.com/canada/?service=rss', 'news', ARRAY['mainstream', 'national']),
  ('National Post', 'https://nationalpost.com', 'https://nationalpost.com/feed/', 'news', ARRAY['mainstream', 'national']),
  ('Global News', 'https://globalnews.ca', 'https://globalnews.ca/feed/', 'news', ARRAY['mainstream', 'national']),
  ('CTV News', 'https://www.ctvnews.ca', 'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009', 'news', ARRAY['mainstream', 'national']),
  ('Toronto Star', 'https://www.thestar.com', 'https://www.thestar.com/feeds.articles.news.rss', 'news', ARRAY['mainstream', 'ontario', 'regional']),
  ('Canadaland', 'https://www.canadaland.com', 'https://www.canadaland.com/feed/', 'commentary', ARRAY['independent', 'media']),
  ('The Tyee', 'https://thetyee.ca', 'https://thetyee.ca/rss2.xml', 'commentary', ARRAY['independent', 'bc', 'progressive']),
  ('Rabble.ca', 'https://rabble.ca', 'https://rabble.ca/feed/', 'commentary', ARRAY['independent', 'progressive']),
  ('iPolitics', 'https://www.ipolitics.ca', 'https://www.ipolitics.ca/feed', 'commentary', ARRAY['independent', 'politics'])
ON CONFLICT (rss_url) DO NOTHING;