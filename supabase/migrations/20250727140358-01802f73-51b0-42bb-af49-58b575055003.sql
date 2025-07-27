-- Add substacks and podcast RSS feeds for the Currents section
INSERT INTO news_sources (name, url, rss_feed_url, category, is_active) VALUES
('The Line (Substack)', 'https://theline.substack.com', 'https://theline.substack.com/feed', 'Commentary', true),
('Canadaland Podcast', 'https://www.canadaland.com', 'https://feeds.soundcloud.com/users/soundcloud:users:85416094/sounds.rss', 'Commentary', true),
('The Hub (Substack)', 'https://thehub.ca', 'https://thehub.ca/feed/', 'Commentary', true),
('Common Sense (Substack)', 'https://bariweiss.substack.com', 'https://bariweiss.substack.com/feed', 'Commentary', true),
('The Dispatch (Substack)', 'https://thedispatch.com', 'https://thedispatch.com/feed/', 'Commentary', true);