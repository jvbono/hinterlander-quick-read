-- Add source_name column to feed_errors table for easier identification
ALTER TABLE public.feed_errors 
ADD COLUMN source_name TEXT;