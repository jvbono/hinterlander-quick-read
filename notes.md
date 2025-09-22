// useNews.ts gathers and organizes the news articles
// supabase functions gets the news
    //why is supabase calling news_sources 
        A: news sources is used as the store for RSS Feeds

//TODO//

[X]figure out why supabase isn't getting articles from all rss feeds: test via cbc 
    possibly resolved: process rss function in supabase pulls from news_sources. CBC and TorStar rss links were incorrect. Fixed those. Should start seeing results
[] need to go through news_sources table in supabase and verify rss links are correct. Can edit cells in the table by clicking
[] fix classifications or articles (region and type)
[] fine tune classification logic, especially region (DB and frontend?)
[X] determine why the frontend only displays 10 or so rows of articles. useNews.ts seems to have the limit set to 200
    A: ColumnSection.tsx had a limit on rows. removed and added endless scroll 10 rows per scroll. Original file preserved as copy