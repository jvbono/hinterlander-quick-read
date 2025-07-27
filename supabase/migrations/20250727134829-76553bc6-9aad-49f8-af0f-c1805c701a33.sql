-- Add opinion and commentary RSS feeds to populate the empty sections
INSERT INTO news_sources (name, url, rss_feed_url, category, is_active) VALUES
('CBC Opinion', 'https://www.cbc.ca', 'https://www.cbc.ca/cmlink/rss-opinion', 'Opinion', true),
('National Post Opinion', 'https://nationalpost.com', 'https://nationalpost.com/category/opinion/feed', 'Opinion', true),
('Globe and Mail Opinion', 'https://www.theglobeandmail.com', 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/opinion/', 'Opinion', true),
('Toronto Star Opinion', 'https://www.thestar.com', 'https://www.thestar.com/content/thestar/feed.RSSManagerServlet.opinion.rss', 'Opinion', true);