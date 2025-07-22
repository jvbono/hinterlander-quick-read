
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import NewsCard from '../components/NewsCard';
import CategoryFilter from '../components/CategoryFilter';
import { useNews } from '../hooks/useNews';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const categories = ['All', 'National', 'Provincial', 'Opinion', 'Rural'];
  
  const { data: newsData = [], isLoading, error, refetch } = useNews(activeCategory);

  const categoryStats = useMemo(() => {
    if (!newsData.length) return { All: 0 };
    
    const stats: Record<string, number> = { All: newsData.length };
    categories.slice(1).forEach(category => {
      stats[category] = newsData.filter(item => item.category === category).length;
    });
    return stats;
  }, [newsData]);

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
        <Header />
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
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            {activeCategory === 'All' ? 'Canadian news, clearly organized' : `${activeCategory} News`}
          </h2>
        </div>

        <div className="mb-6">
          <CategoryFilter 
            categories={categories} 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
          
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={handleRefreshNews} 
              disabled={isRefreshing}
              variant="outline"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh News Feeds'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-6">
                <Skeleton className="h-4 w-20 mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {newsData.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>

            {newsData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No stories found in this category.</p>
                <Button 
                  onClick={handleRefreshNews} 
                  disabled={isRefreshing}
                  variant="default"
                >
                  {isRefreshing ? 'Loading News...' : 'Load Latest News'}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            Hinterlander aggregates Canadian news from diverse sources. 
            Stories link directly to original publishers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
