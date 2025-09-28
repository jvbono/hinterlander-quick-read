import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FeedError {
  id: string;
  source_id: string;
  run_id: string | null;
  error_message: string;
  http_status: number | null;
  timestamp: string;
  news_sources: {
    name: string;
    rss_feed_url: string;
  };
}

interface FeedErrorSummary {
  source_id: string;
  source_name: string;
  rss_feed_url: string;
  total_errors: number;
  latest_error: string;
  latest_timestamp: string;
  recent_errors: FeedError[];
}

export function useFeedErrors() {
  return useQuery({
    queryKey: ['feed-errors'],
    queryFn: async (): Promise<FeedError[]> => {
      const { data, error } = await supabase
        .from('feed_errors')
        .select(`
          id,
          source_id,
          run_id,
          error_message,
          http_status,
          timestamp,
          news_sources:source_id (
            name,
            rss_feed_url
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(200);

      if (error) {
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}

export function useFeedErrorSummary() {
  return useQuery({
    queryKey: ['feed-error-summary'],
    queryFn: async (): Promise<FeedErrorSummary[]> => {
      const { data, error } = await supabase
        .from('feed_errors')
        .select(`
          source_id,
          error_message,
          timestamp,
          news_sources:source_id (
            name,
            rss_feed_url
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (error) {
        throw error;
      }

      // Group errors by source
      const errorMap = new Map<string, FeedErrorSummary>();

      data?.forEach((error: any) => {
        const sourceId = error.source_id;
        const sourceName = error.news_sources?.name || 'Unknown Source';
        const rssUrl = error.news_sources?.rss_feed_url || '';

        if (!errorMap.has(sourceId)) {
          errorMap.set(sourceId, {
            source_id: sourceId,
            source_name: sourceName,
            rss_feed_url: rssUrl,
            total_errors: 0,
            latest_error: error.error_message,
            latest_timestamp: error.timestamp,
            recent_errors: []
          });
        }

        const summary = errorMap.get(sourceId)!;
        summary.total_errors++;
        summary.recent_errors.push(error);

        // Keep only the 10 most recent errors per source
        if (summary.recent_errors.length > 10) {
          summary.recent_errors = summary.recent_errors.slice(0, 10);
        }
      });

      return Array.from(errorMap.values())
        .sort((a, b) => new Date(b.latest_timestamp).getTime() - new Date(a.latest_timestamp).getTime());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // 30 seconds
  });
}
