// useNews.ts gathers and organizes the news articles
// supabase functions gets the news
    //why is supabase calling news_sources (old db)?
    //supabase edge function uses news_sources table to process new rss feeds. links need to be vetted: CBC one has been updated and should work

//TODO//

[]figure out why supabase isn't getting articles from all rss feeds: test via cbc 
    possibly resolved: process rss function in supabase pulls from news_sources. CBC and TorStar rss links were incorrect. Fixed those. Should start seeing results
[] need to go through news_sources table in supabase and verify rss links are correct. Can edit cells in the table by clicking