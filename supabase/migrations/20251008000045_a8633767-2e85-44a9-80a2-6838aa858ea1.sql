-- Drop existing tables (keeping feed_errors for continuity)
DROP TABLE IF EXISTS news_items CASCADE;
DROP TABLE IF EXISTS link_sources CASCADE;
DROP TABLE IF EXISTS links CASCADE;
DROP TABLE IF EXISTS news_sources CASCADE;

-- 0) Enums
CREATE TYPE article_target AS ENUM ('news','commentary','currents');
CREATE TYPE article_status AS ENUM ('pending','ready','dropped');
CREATE TYPE article_lang AS ENUM ('en','fr','und');

-- 1) Sources
CREATE TABLE sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  site_url text NOT NULL,
  rss_url text NOT NULL UNIQUE,
  default_target article_target NOT NULL,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Raw ingest (as-is)
CREATE TABLE raw_items (
  id bigserial PRIMARY KEY,
  source_id uuid REFERENCES sources(id) ON DELETE CASCADE,
  fetched_at timestamptz DEFAULT now(),
  item_json jsonb NOT NULL
);

-- 3) Canonicalized Articles
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid REFERENCES sources(id) ON DELETE SET NULL,
  fetched_at timestamptz DEFAULT now(),
  title text NOT NULL,
  canonical_url text NOT NULL,
  url_domain text GENERATED ALWAYS AS (
    lower(regexp_replace(canonical_url, '^https?://([^/]+)/.*$','\1'))
  ) STORED,
  description text,
  author text,
  image_url text,
  published_at timestamptz,
  lang article_lang DEFAULT 'und',
  
  target_column article_target,
  categories text[] DEFAULT '{}',
  regions text[] DEFAULT '{}',
  topics text[] DEFAULT '{}',
  
  status article_status DEFAULT 'pending',
  dropped_reason text,
  
  url_hash bytea NOT NULL UNIQUE,
  content_hash bytea,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4) Logs and review
CREATE TABLE fetch_logs (
  id bigserial PRIMARY KEY,
  source_id uuid REFERENCES sources(id),
  started_at timestamptz DEFAULT now(),
  finished_at timestamptz,
  ok boolean,
  http_status int,
  error text
);

CREATE TABLE review_queue (
  article_id uuid PRIMARY KEY REFERENCES articles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5) Vocabulary Tables
CREATE TABLE region_vocab (
  slug text PRIMARY KEY,
  display_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE category_vocab (
  slug text PRIMARY KEY,
  display_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE source_region_defaults (
  source_id uuid REFERENCES sources(id) ON DELETE CASCADE,
  region_slug text REFERENCES region_vocab(slug),
  PRIMARY KEY (source_id, region_slug)
);

CREATE TABLE source_category_defaults (
  source_id uuid REFERENCES sources(id) ON DELETE CASCADE,
  category_slug text REFERENCES category_vocab(slug),
  PRIMARY KEY (source_id, category_slug)
);

CREATE TABLE mapping_rules (
  id bigserial PRIMARY KEY,
  target_enum text CHECK (target_enum IN ('region','category')),
  slug text NOT NULL,
  pattern text NOT NULL,
  weight int NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- 6) Indexes
CREATE INDEX idx_articles_target_published ON articles (target_column, published_at DESC);
CREATE INDEX idx_articles_categories ON articles USING gin (categories);
CREATE INDEX idx_articles_topics ON articles USING gin (topics);
CREATE INDEX idx_articles_regions ON articles USING gin (regions);
CREATE INDEX idx_articles_domain ON articles (url_domain);
CREATE INDEX idx_articles_status ON articles (status, fetched_at DESC);
CREATE INDEX idx_articles_source ON articles (source_id, published_at DESC);
CREATE INDEX idx_raw_items_source ON raw_items (source_id, fetched_at DESC);

-- 7) Frontend Views
CREATE VIEW v_news AS
  SELECT * FROM articles WHERE status='ready' AND target_column='news';

CREATE VIEW v_commentary AS
  SELECT * FROM articles WHERE status='ready' AND target_column='commentary';

CREATE VIEW v_currents AS
  SELECT * FROM articles WHERE status='ready' AND target_column='currents';

-- 8) Populate Regions
INSERT INTO region_vocab(slug, display_name) VALUES
 ('national', 'National'),
 ('bc', 'British Columbia'),
 ('alberta', 'Alberta'),
 ('prairies', 'Prairies'),
 ('saskatchewan', 'Saskatchewan'),
 ('manitoba', 'Manitoba'),
 ('ontario', 'Ontario'),
 ('qc', 'Quebec'),
 ('atlantic', 'Atlantic'),
 ('north', 'Northern Canada');

-- 9) Populate Categories
INSERT INTO category_vocab(slug, display_name) VALUES
 ('canada', 'Canada'),
 ('politics', 'Politics'),
 ('business', 'Business'),
 ('tech', 'Technology'),
 ('environment', 'Environment'),
 ('health', 'Health'),
 ('justice', 'Justice'),
 ('housing', 'Housing'),
 ('culture', 'Culture'),
 ('sports', 'Sports');

-- 10) Region Mapping Rules
INSERT INTO mapping_rules(target_enum, slug, pattern, weight) VALUES
 ('region','bc','\\b(B\\.?C\\.?|british columbia|vancouver|victoria|kelowna|kamloops)\\b', 10),
 ('region','alberta','\\b(alberta|calgary|edmonton|red deer|lethbridge)\\b', 10),
 ('region','prairies','\\b(saskatchewan|manitoba|regina|winnipeg|saskatoon)\\b', 10),
 ('region','saskatchewan','\\b(saskatchewan|regina|saskatoon)\\b', 10),
 ('region','manitoba','\\b(manitoba|winnipeg)\\b', 10),
 ('region','north','\\b(yukon|whitehorse|nunavut|yellowknife|northwest territories|nwt|iqaluit)\\b', 10),
 ('region','atlantic','\\b(nova scotia|new brunswick|pei|newfoundland|labrador|halifax|saint john|charlottetown|st\\.? john''s)\\b', 10),
 ('region','ontario','\\b(ontario|toronto|ottawa|waterloo|gta|greater toronto|hamilton|london|windsor|kingston)\\b', 10),
 ('region','qc','\\b(qu[eé]bec|montr[eé]al|quebec city|ville de qu[eé]bec|gatineau|laval)\\b', 10);

-- 11) Category Mapping Rules
INSERT INTO mapping_rules(target_enum, slug, pattern, weight) VALUES
 ('category','politics','\\b(politics|parliament|legislature|minister|election|policy|bill|mp|mpp|mla|senate|liberal|conservative|ndp|bloc|green party)\\b', 10),
 ('category','tech','\\b(technology|startup|software|ai|artificial intelligence|cyber|privacy|app|platform|tech|innovation|digital)\\b', 10),
 ('category','environment','\\b(environment|climate|wildfire|emissions|carbon|biodiversity|conservation|pollution|renewable|sustainability)\\b', 10),
 ('category','business','\\b(business|market|economy|inflation|gdp|merger|acquisition|stock|investment|finance|banking)\\b', 10),
 ('category','health','\\b(health|healthcare|hospital|covid|pandemic|mental health|medical|doctor|nurse|patient)\\b', 10),
 ('category','justice','\\b(court|trial|police|rcmp|charter|rights|crime|criminal|judge|lawyer|lawsuit)\\b', 10),
 ('category','housing','\\b(housing|rent|mortgage|construction|zoning|real estate|property|landlord|tenant|affordability)\\b', 10),
 ('category','culture','\\b(arts|music|film|theatre|literature|fashion|culture|museum|gallery|festival)\\b', 10),
 ('category','sports','\\b(nhl|nba|mlb|cfl|soccer|hockey|football|basketball|olympics|score|tournament|team|player)\\b', 10);

-- 12) RLS Policies
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fetch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_vocab ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_vocab ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapping_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sources are publicly readable" ON sources FOR SELECT USING (true);
CREATE POLICY "Raw items are publicly readable" ON raw_items FOR SELECT USING (true);
CREATE POLICY "Articles are publicly readable" ON articles FOR SELECT USING (true);
CREATE POLICY "Fetch logs are publicly readable" ON fetch_logs FOR SELECT USING (true);
CREATE POLICY "Review queue is publicly readable" ON review_queue FOR SELECT USING (true);
CREATE POLICY "Region vocab is publicly readable" ON region_vocab FOR SELECT USING (true);
CREATE POLICY "Category vocab is publicly readable" ON category_vocab FOR SELECT USING (true);
CREATE POLICY "Mapping rules are publicly readable" ON mapping_rules FOR SELECT USING (true);

-- 13) Update triggers
CREATE TRIGGER update_sources_updated_at BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();