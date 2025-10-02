-- Create a cron job to fetch RSS feeds every 30 minutes
-- This will call the process-rss-feeds edge function automatically
SELECT cron.schedule(
  'fetch-rss-feeds-every-30-minutes',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT
    net.http_post(
        url:='https://qmygzjjqykofxrkiaqca.supabase.co/functions/v1/process-rss-feeds',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteWd6ampxeWtvZnhya2lhcWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NDQyNDMsImV4cCI6MjA2NzMyMDI0M30.lKHJMFj_WPOFXIkq6xbDL2AFx62HWoq-0I5iPzKxzVg"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);