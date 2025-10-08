import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Article, ArticleTarget } from '@/types/news';

export const useArticles = (targetColumn?: ArticleTarget) => {
  return useQuery({
    queryKey: ['articles', targetColumn],
    queryFn: async () => {
      console.info('Debug - useArticles called with targetColumn:', targetColumn);
      console.info('Debug - About to execute query');

      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'ready')
        .order('published_at', { ascending: false })
        .limit(1000);

      if (targetColumn) {
        query = query.eq('target_column', targetColumn);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }

      console.info('Debug - Raw data from query:', data?.length, 'items');
      if (data && data.length > 0) {
        console.info('Debug - First raw item:', data[0]);
      }

      return (data || []) as Article[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};

export const useSources = () => {
  return useQuery({
    queryKey: ['sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useFetchLogs = (limit = 100) => {
  return useQuery({
    queryKey: ['fetch_logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fetch_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
