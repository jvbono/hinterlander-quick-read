import { Article } from '@/types/news';

interface ArticleCardProps {
  article: Article;
  accentColor: string;
}

const ArticleCard = ({ article, accentColor }: ArticleCardProps) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  return (
    <article className="group pb-4 mb-4 border-b border-border/30 last:border-b-0">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${accentColor}`}></span>
        <span className="font-medium">{article.url_domain}</span>
        <span>•</span>
        <time>{formatTime(article.published_at)}</time>
      </div>
      
      <h3 className="text-base font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
        <a 
          href={article.canonical_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {article.title}
        </a>
      </h3>
      
      {article.description && (
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">
          {article.description}
        </p>
      )}
      
      {article.regions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {article.regions.map((region) => (
            <span 
              key={region}
              className="inline-block px-2 py-0.5 text-xs rounded-full bg-secondary/50 text-secondary-foreground"
            >
              {region}
            </span>
          ))}
        </div>
      )}
      
      <a 
        href={article.canonical_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center text-xs text-primary hover:text-primary/80 transition-colors font-medium"
      >
        Read full story →
      </a>
    </article>
  );
};

export default ArticleCard;
