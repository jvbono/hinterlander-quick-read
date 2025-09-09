
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

export interface Link {
  id: string;
  canonical_url: string;
  title: string;
  summary: string | null;
  published_at: string;
  image_url: string | null;
  first_seen_at: string;
  last_seen_at: string;
  source_name: string;
  category: string;
  target_column: string;
}

export interface NewsSource {
  name: string;
  type: 'mainstream' | 'independent' | 'blog' | 'podcast';
  rssUrl: string;
  tags: string[];
}
