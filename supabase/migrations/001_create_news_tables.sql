
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
('National Post', 'mainstream', 'https://nationalpost.com/feed/', ARRAY['national', 'culture', 'politics']),
('Toronto Star', 'mainstream', 'https://www.thestar.com/news.rss', ARRAY['provincial', 'ontario']),
('The Line', 'independent', 'https://theline.substack.com/feed', ARRAY['opinion', 'politics']),
('Canadaland', 'independent', 'https://www.canadaland.com/feed/', ARRAY['media', 'opinion']),
('Western Producer', 'independent', 'https://www.producer.com/feed/', ARRAY['rural', 'agriculture']),
('Radio-Canada', 'mainstream', 'https://ici.radio-canada.ca/rss/83', ARRAY['national', 'french']),
('Vancouver Sun', 'mainstream', 'https://vancouversun.com/feed/', ARRAY['provincial', 'british-columbia']),
('Calgary Herald', 'mainstream', 'https://calgaryherald.com/feed/', ARRAY['provincial', 'alberta']),
('Winnipeg Free Press', 'mainstream', 'https://www.winnipegfreepress.com/RSS/', ARRAY['provincial', 'manitoba']);
('Toronto Sun', 'mainstream', 'https://torontosun.com/feed', ARRAY['provincial', 'ontario']),
('Financial Post', 'mainstream', 'https://feeds.feedburner.com/FP_TopStories', ARRAY['national', 'business']),
('Calgary Herald', 'mainstream', 'https://calgaryherald.com/feed', ARRAY['provincial', 'alberta']),
('CityNews Toronto', 'mainstream', 'https://toronto.citynews.ca/feed/', ARRAY['provincial', 'ontario']),
('Edmonton Journal', 'mainstream', 'https://edmontonjournal.com/feed', ARRAY['provincial', 'alberta']),
('Windsor Star', 'mainstream', 'https://windsorstar.com/feed', ARRAY['local', 'ontario']),
('The Province', 'mainstream', 'https://theprovince.com/feed', ARRAY['provincial', 'british-columbia']),
('Calgary Sun', 'mainstream', 'https://calgarysun.com/feed', ARRAY['provincial', 'alberta']),
('Ottawa Sun', 'mainstream', 'https://ottawasun.com/feed', ARRAY['provincial', 'ontario']),
('StarPhoenix', 'mainstream', 'https://thestarphoenix.com/feed', ARRAY['provincial', 'saskatchewan']),
('Edmonton Sun', 'mainstream', 'https://edmontonsun.com/feed', ARRAY['provincial', 'alberta']),
('Canada.com', 'mainstream', 'https://o.canada.com/feed', ARRAY['national']),
('Leader-Post', 'mainstream', 'https://leaderpost.com/feed', ARRAY['provincial', 'saskatchewan']),
('Owen Sound Sun Times', 'mainstream', 'https://www.owensoundsuntimes.com/feed', ARRAY['local', 'ontario']),
('Ottawa Citizen', 'mainstream', 'https://ottawacitizen.com/feed', ARRAY['provincial', 'ontario']),
('Stratford Beacon Herald', 'mainstream', 'https://www.stratfordbeaconherald.com/feed', ARRAY['local', 'ontario']),
('Daily Herald Tribune', 'mainstream', 'https://www.dailyheraldtribune.com/feed', ARRAY['local', 'alberta']),
('YGK News', 'independent', 'https://ygknews.ca/feed/', ARRAY['local', 'ontario']),
('Prince Albert Daily Herald', 'mainstream', 'https://paherald.sk.ca/feed/', ARRAY['local', 'culture', 'saskatchewan']),
('Sunny South News', 'mainstream', 'https://www.sunnysouthnews.com/feed/', ARRAY['local', 'alberta']),
('The Tyee', 'independent', 'https://thetyee.ca/rss2.xml', ARRAY['commentary', 'british-columbia']),
('National Observer', 'independent', 'https://www.nationalobserver.com/front/rss', ARRAY['opinion', 'national']),
('Business in Vancouver', 'mainstream', 'https://www.biv.com/rss', ARRAY['business', 'british-columbia']),
('The Georgia Straight', 'independent', 'https://www.straight.com/content/rss', ARRAY['culture', 'british-columbia']),
('The Afro News', 'independent', 'https://theafronews.com/feed/', ARRAY['commentary', 'diversity']),
('The Canadian Press', 'mainstream', 'https://www.thecanadianpressnews.ca/search/?f=rss', ARRAY['national', 'wire']),
('Rabble.ca', 'independent', 'https://rabble.ca/feed/', ARRAY['opinion', 'progressive']);
('WIRED', 'mainstream', 'https://www.wired.com/feed/rss', ARRAY['opinion', 'technology', 'culture']);

