-- Update RSS feed URLs with working current endpoints
UPDATE news_sources SET rss_feed_url = 'https://www.cbc.ca/cmlink/rss-canada' WHERE name = 'CBC News';
UPDATE news_sources SET rss_feed_url = 'https://www.ctvnews.ca/rss/ctvnews-ca-canada-public-rss-1.822284' WHERE name = 'CTV News';
UPDATE news_sources SET rss_feed_url = 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/' WHERE name = 'The Globe and Mail';
UPDATE news_sources SET rss_feed_url = 'https://www.thestar.com/content/thestar/feed.RSSManagerServlet.canada.rss' WHERE name = 'Toronto Star';