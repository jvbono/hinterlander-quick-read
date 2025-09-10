-- Remove Common Sense (Substack) completely from the database
-- First get the source ID
DO $$
DECLARE
    source_uuid uuid;
BEGIN
    -- Get the source ID
    SELECT id INTO source_uuid FROM news_sources WHERE name = 'Common Sense (Substack)';
    
    IF source_uuid IS NOT NULL THEN
        -- Delete from link_sources first
        DELETE FROM link_sources WHERE source_id = source_uuid;
        
        -- Delete from news_items
        DELETE FROM news_items WHERE source_id = source_uuid;
        
        -- Finally delete the news source
        DELETE FROM news_sources WHERE id = source_uuid;
    END IF;
END $$;