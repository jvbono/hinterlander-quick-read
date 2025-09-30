import { Link } from '../types/news';
import ArticleCard from './ArticleCard';

interface ColumnSectionProps {
  title: string;
  description: string;
  icon: string;
  articles: Link[];
  accentColor: string;
}

const ColumnSection = ({ title, description, icon, articles, accentColor }: ColumnSectionProps) => {
  return (
    <div className="flex flex-col">
      <div className="mb-6 pb-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{icon}</span>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>
        <p className="text-sm text-muted-foreground italic leading-relaxed">
          {description}
        </p>
      </div>
      
      <div className="space-y-4">
        {articles.slice(0, 10).map((article) => (
          <ArticleCard 
            key={article.id} 
            article={article} 
            accentColor={accentColor}
          />
        ))}
        
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