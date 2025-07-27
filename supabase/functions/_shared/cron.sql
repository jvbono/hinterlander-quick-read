
-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule RSS feed updates every 10 minutes
SELECT cron.schedule(
  'rss-feed-update',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://qmygzjjqykofxrkiaqca.supabase.co/functions/v1/scheduled-rss-update',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb
    ) as request_id;
  $$
);
