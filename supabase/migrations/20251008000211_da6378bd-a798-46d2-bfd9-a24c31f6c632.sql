-- Enable RLS on tables that were missing it
ALTER TABLE source_region_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_category_defaults ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for the missing tables
CREATE POLICY "Source region defaults are publicly readable" 
  ON source_region_defaults FOR SELECT USING (true);

CREATE POLICY "Source category defaults are publicly readable" 
  ON source_category_defaults FOR SELECT USING (true);