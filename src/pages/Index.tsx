
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import NewsCard from '../components/NewsCard';
import CategoryFilter from '../components/CategoryFilter';
import { useNews } from '../hooks/useNews';
import { Skeleton } from '../components/ui/skeleton';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'National', 'Provincial', 'Opinion', 'Rural'];
  
  const { data: newsData = [], isLoading, error } = useNews(activeCategory);

  const categoryStats = useMemo(() => {
    if (!newsData.length) return { All: 0 };
    
    const stats: Record<string, number> = { All: newsData.length };
    categories.slice(1).forEach(category => {
      stats[category] = newsData.filter(item => item.category === category).length;
    });
    return stats;
  }, [newsData]);

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
            {activeCategory === 'All' ? 'All Stories' : `${activeCategory} News`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              'Loading stories...'
            ) : (
              `${newsData.length} ${newsData.length === 1 ? 'story' : 'stories'} available`
            )}
          </p>
        </div>

        <CategoryFilter 
          categories={categories} 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

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
                <p className="text-muted-foreground">No stories found in this category.</p>
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
