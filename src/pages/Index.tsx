
import { useState, useMemo } from 'react';
import Header from '../components/Header';
import ColumnSection from '../components/ColumnSection';
import { useLinks } from '../hooks/useNews';
import { Skeleton } from '../components/ui/skeleton';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';
import { Link } from '../types/news';

const Index = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  const { data: linksData = [], isLoading, error, refetch } = useLinks();

  console.log('Debug - Links data:', linksData.length, 'items loaded');
  console.log('Debug - First few items:', linksData.slice(0, 2));

  // Organize and filter articles by target column and province
  const organizedNews = useMemo(() => {
    if (!linksData.length) return { news: [], opinion: [], currents: [] };
    
    let filteredData = linksData;
    
    // Filter by province if selected
    if (selectedProvince) {
      // Create province matching patterns including common abbreviations
      const getProvincePatterns = (province: string) => {
        const patterns = [province.toLowerCase()];
        
        switch (province) {
          case 'British Columbia':
            patterns.push('b.c.', 'bc', 'british columbia', 'kelowna', 'vancouver', 'victoria', 'bcgeu');
            break;
          case 'Alberta':
            patterns.push('ab', 'alberta', 'calgary', 'edmonton');
            break;
          case 'Ontario':
            patterns.push('on', 'ontario', 'toronto', 'ottawa');
            break;
          case 'Quebec':
            patterns.push('qc', 'quebec', 'montreal');
            break;
          case 'Saskatchewan':
            patterns.push('sk', 'saskatchewan', 'saskatoon', 'regina');
            break;
          case 'Manitoba':
            patterns.push('mb', 'manitoba', 'winnipeg');
            break;
          case 'Nova Scotia':
            patterns.push('ns', 'nova scotia', 'halifax');
            break;
          case 'New Brunswick':
            patterns.push('nb', 'new brunswick', 'fredericton');
            break;
          case 'Newfoundland and Labrador':
            patterns.push('nl', 'newfoundland', 'labrador', 'st. john\'s');
            break;
          case 'Prince Edward Island':
            patterns.push('pei', 'prince edward island', 'charlottetown');
            break;
          case 'Northwest Territories':
            patterns.push('nt', 'nwt', 'northwest territories', 'yellowknife');
            break;
          case 'Nunavut':
            patterns.push('nu', 'nunavut', 'iqaluit');
            break;
          case 'Yukon':
            patterns.push('yt', 'yukon', 'whitehorse');
            break;
        }
        
        return patterns;
      };
      
      const provincePatterns = getProvincePatterns(selectedProvince);
      
      filteredData = linksData.filter(item => {
        const titleText = item.title.toLowerCase();
        const summaryText = item.summary?.toLowerCase() || '';
        const sourceText = item.source_name.toLowerCase();
        
        return provincePatterns.some(pattern => 
          titleText.includes(pattern) ||
          summaryText.includes(pattern) ||
          sourceText.includes(pattern)
        );
      });
    }
    
    // Filter by target_column from news sources
    const news = filteredData.filter(item => 
      item.target_column === 'news'
    );
    
    const opinion = filteredData.filter(item => 
      item.target_column === 'commentary'
    );
    
    const currents = filteredData.filter(item => 
      item.target_column === 'currents'
    );
    
    console.log('Debug - Organized articles:', { 
      newsCount: news.length, 
      opinionCount: opinion.length, 
      currentsCount: currents.length 
    });
    console.log('Debug - Sample currents articles:', currents.slice(0, 3).map(a => ({ title: a.title, target_column: a.target_column })));
    
    return { news, opinion, currents };
  }, [linksData, selectedProvince]);

  const handleRefreshNews = async () => {
    setIsRefreshing(true);
    try {
      // Just reload data from database - RSS feeds update automatically every 30 minutes
      await refetch();
      toast({
        title: "Refreshed", 
        description: "Latest stories loaded from database",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reload news",
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
              articles={organizedNews.currents}
              accentColor="bg-purple-500"
            />
          </div>
        )}

        {!isLoading && linksData.length === 0 && (
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
