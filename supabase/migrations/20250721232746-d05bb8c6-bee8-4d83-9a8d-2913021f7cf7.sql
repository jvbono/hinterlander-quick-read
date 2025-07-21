-- Add missing column to news_sources table
ALTER TABLE public.news_sources 
ADD COLUMN last_fetched_at TIMESTAMP WITH TIME ZONE;