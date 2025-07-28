
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: Date;
  category: 'National' | 'Provincial' | 'Opinion' | 'Rural' | 'Commentary';
  url: string;
  imageUrl?: string;
  target_column?: 'news' | 'opinion' | 'currents';
}

export interface NewsSource {
  name: string;
  type: 'mainstream' | 'independent' | 'blog' | 'podcast';
  rssUrl: string;
  tags: string[];
}
