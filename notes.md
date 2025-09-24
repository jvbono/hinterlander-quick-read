#General notes

// useNews.ts gathers and organizes the news articles

// supabase functions gets the news

    //why is supabase calling news_sources 

        A: news sources is used as the store for RSS Feeds

//Possible flow: page load, cronjob calls update-rss-feed which calls process-rss-feed, which uses news_sources to generate news_links

//CBC is returning a type error when update-rss-feed runs: suspected different feed formatting may be causing an issue

#//TODO//

[X]figure out why supabase isn't getting articles from all rss feeds: test via cbc 
    possibly resolved: process rss function in supabase pulls from news_sources. CBC and TorStar rss links were incorrect. Fixed those. Should start seeing results

[] need to go through news_sources table in supabase and verify rss links are correct. Can edit cells in the table by clicking

[] fix classifications or articles (region and type)

[] fine tune classification logic, especially region (DB and frontend?)

[X] determine why the frontend only displays 10 or so rows of articles. useNews.ts seems to have the limit set to 200

    A: ColumnSection.tsx had a limit on rows. removed and added endless scroll 10 rows per scroll. Original file preserved as copy

[] Change logic so articles arent grouped by source. Current logic sorts by most recent. Some pubs dump a bunch of articles at a time, leading to ie. 5 Globe and Mail artcles in a row

[] Look into RSS formatting re CBC type error - might be fixed by adding/amending some of our types


JULIAN NOTES

// I learned how to add feeds to the database. easiest to use the SQL editor to add net new feeds. to edit feeds already in the database, it's easiest to directly edit the database itself. 

Example code:
BEGIN;

INSERT INTO news_sources
  (name, url, rss_feed_url, category, target_column, is_active)
VALUES
  -- jwz (Jamie Zawinski)
  ('jwz (Jamie Zawinski)', 'https://www.jwz.org/blog/', 'https://cdn.jwz.org/blog/feed/', 'Commentary', 'opinion', TRUE),

  -- Pluralistic (Cory Doctorow) — tag feed
  ('Pluralistic (Cory Doctorow)', 'https://pluralistic.net/', 'https://pluralistic.net/tag/rss/', 'Commentary', 'opinion', TRUE),

  -- Where''s Your Ed At? (Ed Zitron)
  ('Where''s Your Ed At? (Ed Zitron)', 'https://www.wheresyoured.at/', 'https://www.wheresyoured.at/rss/', 'Commentary', 'opinion', TRUE);

COMMIT;

// NEXT STEPS

 [] figure out why certain feeds still don't seem to be showing up (CBC, etc)
 
 [] update categories - news, commentary, current
      [] news is for reporting
      [] commentary is editorials, substacks, etc - essentially merging newspaper editorials with commentary from blogs, substacks, etc
      [] currents is long form, miscellaneous - some good examples Doctorow, Ed Zitron, jwz, more
      [] add podcasts - organize podcasts based on sections above, mix and match with written word
      
 [] brand from Heath
     [] logo / wordmark
     [] colours
     
 [] add more sources
 
 [] consider filters for ensuring diverse sources appear above fold, introduce pure chronological once scroll begins
 
 [] add button to share on Mastadon, Bluesky

