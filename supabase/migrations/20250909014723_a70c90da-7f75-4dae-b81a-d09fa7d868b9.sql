-- Create links table for unified article storage
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  canonical_url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url TEXT,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create link_sources junction table to track which sources mentioned which links
CREATE TABLE public.link_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.news_sources(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(link_id, source_id)
);

-- Enable RLS on both tables
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Links are publicly readable" 
ON public.links 
FOR SELECT 
USING (true);

CREATE POLICY "Link sources are publicly readable" 
ON public.link_sources 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_links_canonical_url ON public.links(canonical_url);
CREATE INDEX idx_links_published_at ON public.links(published_at DESC);
CREATE INDEX idx_links_last_seen_at ON public.links(last_seen_at DESC);
CREATE INDEX idx_link_sources_link_id ON public.link_sources(link_id);
CREATE INDEX idx_link_sources_source_id ON public.link_sources(source_id);
CREATE INDEX idx_link_sources_category ON public.link_sources(category);

-- Create trigger for automatic timestamp updates on links
CREATE TRIGGER update_links_updated_at
BEFORE UPDATE ON public.links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on link_sources
CREATE TRIGGER update_link_sources_updated_at
BEFORE UPDATE ON public.link_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();