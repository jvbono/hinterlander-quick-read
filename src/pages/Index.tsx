
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import NewsCard from '../components/NewsCard';
import CategoryFilter from '../components/CategoryFilter';
import { mockNewsData } from '../data/mockNews';
import { NewsItem } from '../types/news';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const categories = ['All', 'National', 'Provincial', 'Opinion', 'Rural'];
  
  const filteredNews = useMemo(() => {
    if (activeCategory === 'All') {
      return mockNewsData;
    }
    return mockNewsData.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = { All: mockNewsData.length };
    categories.slice(1).forEach(category => {
      stats[category] = mockNewsData.filter(item => item.category === category).length;
    });
    return stats;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            {activeCategory === 'All' ? 'All Stories' : `${activeCategory} News`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredNews.length} {filteredNews.length === 1 ? 'story' : 'stories'} available
          </p>
        </div>

        <CategoryFilter 
          categories={categories} 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No stories found in this category.</p>
          </div>
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
