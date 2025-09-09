
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface Link {
  id: string;
  canonical_url: string;
  title: string;
  summary: string | null;
  published_at: string;
  image_url: string | null;
  first_seen_at: string;
  last_seen_at: string;
  source_name: string;
  category: string;
  target_column: string;
}

export const useLinks = (targetColumn?: string) => {
  return useQuery({
    queryKey: ['links', targetColumn],
    queryFn: async (): Promise<Link[]> => {
      let query = supabase
        .from('links')
        .select(`
          *,
          link_sources!inner(
            category,
            news_sources!inner(
              name,
              target_column
            )
          )
        `)
        .order('published_at', { ascending: false })
        .limit(50);

      if (targetColumn && targetColumn !== 'all') {
        query = query.eq('link_sources.news_sources.target_column', targetColumn);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching links:', error);
        throw new Error(error.message);
      }

      return data.map((item: any) => ({
        id: item.id,
        canonical_url: item.canonical_url,
        title: item.title,
        summary: item.summary || '',
        published_at: new Date(item.published_at).toISOString(),
        image_url: item.image_url,
        first_seen_at: item.first_seen_at,
        last_seen_at: item.last_seen_at,
        source_name: item.link_sources[0]?.news_sources?.name || '',
        category: item.link_sources[0]?.category || '',
        target_column: item.link_sources[0]?.news_sources?.target_column || ''
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
};

export const useNewsSources = () => {
  return useQuery({
    queryKey: ['news-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching news sources:', error);
        throw new Error(error.message);
      }

      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
