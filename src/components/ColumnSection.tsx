import { useState, useRef, useEffect, useCallback } from 'react';
import { Article } from '../types/news';
import ArticleCard from './ArticleCard';

interface ColumnSectionProps {
  title: string;
  description: string;
  icon: string;
  articles: Article[];
  accentColor: string;
}

const ColumnSection = ({ title, description, icon, articles, accentColor }: ColumnSectionProps) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Load more articles (10 at a time)
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + 10, articles.length));
  }, [articles.length]);

  // Observe when the loader enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        rootMargin: '100px',
      }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMore]);

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <div className="flex flex-col">
      <div className="mb-6 pb-4 border-b-2 border-foreground/80">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          {description}
        </p>
      </div>

      <div className="space-y-4">
        {visibleArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            accentColor={accentColor}
          />
        ))}

        {/* Loader for intersection observer */}
        {visibleCount < articles.length && (
          <div ref={loaderRef} className="py-4 text-center text-sm text-muted-foreground">
            Loading more...
          </div>
        )}

        {articles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No stories available in this section.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColumnSection;
