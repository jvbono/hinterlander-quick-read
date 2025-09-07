
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { NewsItem } from '../types/news';

export const useNews = (category?: string) => {
  return useQuery({
    queryKey: ['news', category],
    queryFn: async (): Promise<NewsItem[]> => {
      let query = supabase
        .from('news_items')
        .select(`
          *,
          news_sources!inner(target_column, name)
        `)
        .order('published_at', { ascending: false })
        .limit(50);

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching news:', error);
        throw new Error(error.message);
      }

      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.summary || '',
        source: item.source,
        publishedAt: new Date(item.published_at),
        category: item.category as 'National' | 'Provincial' | 'Opinion' | 'Rural' | 'Commentary',
        url: item.url,
        imageUrl: item.image_url,
        target_column: item.news_sources?.target_column as 'news' | 'opinion' | 'currents'
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
