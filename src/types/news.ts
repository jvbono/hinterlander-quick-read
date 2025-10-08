export type ArticleTarget = 'news' | 'commentary' | 'currents';
export type ArticleStatus = 'pending' | 'ready' | 'dropped';
export type ArticleLang = 'en' | 'fr' | 'und';

export interface Article {
  id: string;
  source_id: string | null;
  fetched_at: string;
  title: string;
  canonical_url: string;
  url_domain: string;
  description: string | null;
  author: string | null;
  image_url: string | null;
  published_at: string;
  lang: ArticleLang;
  target_column: ArticleTarget;
  categories: string[];
  regions: string[];
  topics: string[];
  status: ArticleStatus;
  dropped_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  name: string;
  site_url: string;
  rss_url: string;
  default_target: ArticleTarget;
  tags: string[];
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchLog {
  id: number;
  source_id: string | null;
  started_at: string;
  finished_at: string | null;
  ok: boolean | null;
  http_status: number | null;
  error: string | null;
}

// Legacy types for backwards compatibility during transition
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
