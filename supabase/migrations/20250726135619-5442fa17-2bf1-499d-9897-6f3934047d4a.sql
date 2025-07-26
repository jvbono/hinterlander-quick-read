-- Update RSS feed URLs to working endpoints
UPDATE news_sources SET rss_feed_url = 'https://www.cbc.ca/cmlink/rss-topstories' WHERE name = 'CBC News';
UPDATE news_sources SET rss_feed_url = 'https://www.ctvnews.ca/rss/top-stories' WHERE name = 'CTV News';
UPDATE news_sources SET rss_feed_url = 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/section/news/' WHERE name = 'The Globe and Mail';
UPDATE news_sources SET rss_feed_url = 'https://www.thestar.com/news.rss' WHERE name = 'Toronto Star';