
import { NewsItem } from '../types/news';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard = ({ item }: NewsCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-CA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'National':
        return 'bg-blue-100 text-blue-800';
      case 'Provincial':
        return 'bg-green-100 text-green-800';
      case 'Opinion':
        return 'bg-purple-100 text-purple-800';
      case 'Rural':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Badge className={`text-xs ${getCategoryColor(item.category)} border-0`}>
            {item.category}
          </Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(item.publishedAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group"
        >
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2 leading-tight">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {item.summary}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {item.source}
            </span>
            <span className="text-xs text-primary group-hover:underline">
              Read full story →
            </span>
          </div>
        </a>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
