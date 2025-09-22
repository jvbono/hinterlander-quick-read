
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
      console.log('Debug - useLinks called with targetColumn:', targetColumn);
      
      // Fetch more articles to ensure we get good distribution
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
        .limit(200);

      if (targetColumn && targetColumn !== 'all') {
        query = query.eq('link_sources.news_sources.target_column', targetColumn);
      }

      console.log('Debug - About to execute query');
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching links:', error);
        throw new Error(error.message);
      }

      console.log('Debug - Raw data from query:', data?.length, 'items');
      console.log('Debug - First raw item:', data?.[0]);

      // Handle the nested data structure properly
      const transformedData = data.map((item: any) => {
        const linkSource = Array.isArray(item.link_sources) ? item.link_sources[0] : item.link_sources;
        const newsSource = linkSource?.news_sources;
        
        return {
          id: item.id,
          canonical_url: item.canonical_url,
          title: item.title,
          summary: item.summary || '',
          published_at: item.published_at,
          image_url: item.image_url,
          first_seen_at: item.first_seen_at,
          last_seen_at: item.last_seen_at,
          source_name: newsSource?.name || '',
          category: linkSource?.category || '',
          target_column: newsSource?.target_column || ''
        };
      });

      console.log('Debug - Transformed data:', transformedData.length, 'items');
      console.log('Debug - First transformed item:', transformedData[0]);

      return transformedData;
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
