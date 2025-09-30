-- Create feed_errors table for tracking RSS ingestion failures
CREATE TABLE public.feed_errors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID NOT NULL REFERENCES public.news_sources(id) ON DELETE CASCADE,
  run_id UUID NULL,
  error_message TEXT NOT NULL,
  http_status INTEGER NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feed_errors ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for admin interface)
CREATE POLICY "Feed errors are publicly readable" 
ON public.feed_errors 
FOR SELECT 
USING (true);

-- Create index for better performance when querying by source and timestamp
CREATE INDEX idx_feed_errors_source_timestamp ON public.feed_errors(source_id, timestamp DESC);
CREATE INDEX idx_feed_errors_run_id ON public.feed_errors(run_id);
CREATE INDEX idx_feed_errors_timestamp ON public.feed_errors(timestamp DESC);