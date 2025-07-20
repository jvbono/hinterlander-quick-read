
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { NewsItem } from '../types/news';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not configured. Please set up your Supabase integration in Lovable.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const useNews = (category?: string) => {
  return useQuery({
    queryKey: ['news', category],
    queryFn: async (): Promise<NewsItem[]> => {
      let query = supabase
        .from('news_items')
        .select('*')
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
        category: item.category as 'National' | 'Provincial' | 'Opinion' | 'Rural',
        url: item.url,
        imageUrl: item.image_url
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
