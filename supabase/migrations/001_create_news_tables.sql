
-- Create news sources table
CREATE TABLE news_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mainstream', 'independent', 'blog', 'podcast')),
  rss_url TEXT NOT NULL UNIQUE,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news items table
CREATE TABLE news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  source TEXT NOT NULL,
  source_id UUID REFERENCES news_sources(id),
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('National', 'Provincial', 'Opinion', 'Rural')),
  url TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(external_id, source_id)
);

-- Create indexes for better performance
CREATE INDEX idx_news_items_published_at ON news_items(published_at DESC);
CREATE INDEX idx_news_items_category ON news_items(category);
CREATE INDEX idx_news_items_source ON news_items(source);
CREATE INDEX idx_news_sources_active ON news_sources(is_active);

-- Insert Canadian news sources
INSERT INTO news_sources (name, type, rss_url, tags) VALUES
('CBC News', 'mainstream', 'https://www.cbc.ca/cmlink/rss-topstories', ARRAY['national', 'general']),
('Globe and Mail', 'mainstream', 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/', ARRAY['national', 'business']),
('CTV News', 'mainstream', 'https://www.ctvnews.ca/rss/ctvnews-ca-top-stories-public-rss-1.822009', ARRAY['national', 'general']),
('National Post', 'mainstream', 'https://nationalpost.com/feed/', ARRAY['national', 'politics']),
('Toronto Star', 'mainstream', 'https://www.thestar.com/news.rss', ARRAY['provincial', 'ontario']),
('The Line', 'independent', 'https://theline.substack.com/feed', ARRAY['opinion', 'politics']),
('Canadaland', 'independent', 'https://www.canadaland.com/feed/', ARRAY['media', 'opinion']),
('Western Producer', 'independent', 'https://www.producer.com/feed/', ARRAY['rural', 'agriculture']),
('Radio-Canada', 'mainstream', 'https://ici.radio-canada.ca/rss/83', ARRAY['national', 'french']),
('Vancouver Sun', 'mainstream', 'https://vancouversun.com/feed/', ARRAY['provincial', 'british-columbia']),
('Calgary Herald', 'mainstream', 'https://calgaryherald.com/feed/', ARRAY['provincial', 'alberta']),
('Winnipeg Free Press', 'mainstream', 'https://www.winnipegfreepress.com/RSS/', ARRAY['provincial', 'manitoba']);
