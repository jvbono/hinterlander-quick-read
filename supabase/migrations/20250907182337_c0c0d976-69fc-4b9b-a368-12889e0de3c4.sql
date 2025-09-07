-- Remove the broken Unknown Source feed
DELETE FROM news_sources WHERE name = 'Unknown Source' AND rss_feed_url = 'https://example.com/rss';

-- Add the missing Canadian commentary feeds that should have been added
INSERT INTO news_sources (name, url, rss_feed_url, category, is_active, target_column) VALUES
('338Canada', 'https://www.338canada.ca/', 'https://www.338canada.ca/feed/', 'Commentary', true, 'currents'),
('David Coletto (Substack)', 'https://davidcoletto.substack.com', 'https://davidcoletto.substack.com/feed', 'Commentary', true, 'currents'),
('The Writ', 'https://www.thewrit.ca/', 'https://www.thewrit.ca/feed/', 'Commentary', true, 'currents'),
('The Thursday Question (Substack)', 'https://thethursdayquestion.substack.com', 'https://thethursdayquestion.substack.com/feed', 'Commentary', true, 'currents'),
('Read the Line', 'https://www.readtheline.ca/', 'https://www.readtheline.ca/feed/', 'Commentary', true, 'currents'),
('Orbit Policy (Substack)', 'https://orbitpolicy.substack.com', 'https://orbitpolicy.substack.com/feed', 'Commentary', true, 'currents'),
('Metaviews (Substack)', 'https://metaviews.substack.com', 'https://metaviews.substack.com/feed', 'Commentary', true, 'currents'),
('David Moscrop', 'https://www.davidmoscrop.com/', 'https://www.davidmoscrop.com/feed/', 'Commentary', true, 'currents'),
('Bug-eyed and Shameless (Substack)', 'https://www.bugeyedandshameless.com/', 'https://www.bugeyedandshameless.com/feed/', 'Commentary', true, 'currents'),
('Paul Wells (Substack)', 'https://paulwells.substack.com', 'https://paulwells.substack.com/feed', 'Commentary', true, 'currents'),
('Toronto History Weekly (Substack)', 'https://torontohistory.substack.com', 'https://torontohistory.substack.com/feed', 'Commentary', true, 'currents'),
('Art Forecast (Substack)', 'https://artforecast.substack.com', 'https://artforecast.substack.com/feed', 'Commentary', true, 'currents'),
('Future of Workers (Substack)', 'https://futureofworkers.substack.com', 'https://futureofworkers.substack.com/feed', 'Commentary', true, 'currents'),
('City Hall Watcher (Substack)', 'https://toronto.cityhallwatcher.com', 'https://toronto.cityhallwatcher.com/feed', 'Commentary', true, 'currents'),
('1236 (Substack)', 'https://1236.substack.com', 'https://1236.substack.com/feed', 'Commentary', true, 'currents'),
('Hatchet (Substack)', 'https://hatchetmedia.substack.com', 'https://hatchetmedia.substack.com/feed', 'Commentary', true, 'currents'),
('The Orchard', 'https://www.readtheorchard.org/', 'https://www.readtheorchard.org/feed/', 'Commentary', true, 'currents'),
('Ed Hollett (Substack)', 'https://edhollett.substack.com', 'https://edhollett.substack.com/feed', 'Commentary', true, 'currents'),
('Emmett Macfarlane (Substack)', 'https://emmettmacfarlane.substack.com', 'https://emmettmacfarlane.substack.com/feed', 'Commentary', true, 'currents'),
('Daveberta (Substack)', 'https://daveberta.substack.com', 'https://daveberta.substack.com/feed', 'Commentary', true, 'currents'),
('Alberta Politics (Substack)', 'https://albertapolitics.substack.com', 'https://albertapolitics.substack.com/feed', 'Commentary', true, 'currents'),
('Scrimshaw Unscripted (Substack)', 'https://scrimshawunscripted.substack.com', 'https://scrimshawunscripted.substack.com/feed', 'Commentary', true, 'currents');