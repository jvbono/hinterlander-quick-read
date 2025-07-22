-- Update RSS feed URLs to working ones
UPDATE news_sources SET rss_feed_url = 'https://rss.cbc.ca/lineup/topstories.xml' WHERE name = 'CBC News';
UPDATE news_sources SET rss_feed_url = 'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009' WHERE name = 'CTV News';
UPDATE news_sources SET rss_feed_url = 'https://www.thestar.com/content/thestar/feed.RSSManagerServlet.topstories.rss' WHERE name = 'Toronto Star';