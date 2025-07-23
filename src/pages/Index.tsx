
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import ColumnSection from '../components/ColumnSection';
import { useNews } from '../hooks/useNews';
import { Skeleton } from '../components/ui/skeleton';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { NewsItem } from '../types/news';

const Index = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const { data: newsData = [], isLoading, error, refetch } = useNews(activeFilter);

  // Organize and filter articles by type and province
  const organizedNews = useMemo(() => {
    if (!newsData.length) return { news: [], opinion: [], commentary: [] };
    
    let filteredData = newsData;
    
    // Filter by province if selected
    if (selectedProvince) {
      filteredData = newsData.filter(item => 
        item.title.toLowerCase().includes(selectedProvince.toLowerCase()) ||
        item.summary?.toLowerCase().includes(selectedProvince.toLowerCase()) ||
        item.source.toLowerCase().includes(selectedProvince.toLowerCase())
      );
    }
    
    const news = filteredData.filter(item => 
      ['National', 'Provincial', 'Rural'].includes(item.category)
    );
    
    const opinion = filteredData.filter(item => 
      item.category === 'Opinion'
    );
    
    // For now, commentary will be empty until we add new sources
    const commentary: NewsItem[] = [];
    
    return { news, opinion, commentary };
  }, [newsData, selectedProvince]);

  const handleRefreshNews = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-rss-feeds');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to refresh news feeds",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success", 
          description: "News feeds refreshed successfully",
        });
        // Refetch the news data
        await refetch();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to refresh news feeds",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onRefresh={handleRefreshNews}
          isRefreshing={isRefreshing}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          selectedProvince={selectedProvince}
          onProvinceChange={setSelectedProvince}
        />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading news: {error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-primary hover:underline"
            >
              Try refreshing the page
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onRefresh={handleRefreshNews}
        isRefreshing={isRefreshing}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        selectedProvince={selectedProvince}
        onProvinceChange={setSelectedProvince}
      />
      
      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="mb-6 pb-4 border-b border-border/50">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="pb-4 mb-4 border-b border-border/30">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <ColumnSection
              title="News"
              description=""
              icon=""
              articles={organizedNews.news}
              accentColor="bg-blue-500"
            />
            
            <ColumnSection
              title="Opinion"
              description=""
              icon=""
              articles={organizedNews.opinion}
              accentColor="bg-orange-500"
            />
            
            <ColumnSection
              title="Currents"
              description=""
              icon=""
              articles={organizedNews.commentary}
              accentColor="bg-purple-500"
            />
          </div>
        )}

        {!isLoading && newsData.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">No stories available at the moment.</p>
            <button
              onClick={handleRefreshNews}
              disabled={isRefreshing}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              {isRefreshing ? 'Loading News...' : 'Load Latest News'}
            </button>
          </div>
        )}
      </main>
      
      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            The Hinterlander aggregates Canadian news from diverse sources.<br />
            Stories link directly to original publishers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
