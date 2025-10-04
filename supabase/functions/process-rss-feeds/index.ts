import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.2'

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid?: string;
  category?: string;
}

interface NewsSource {
  id: string;
  name: string;
  url: string;
  rss_feed_url: string;
  category: string;
  is_active: boolean;
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate unique run ID for this ingestion run
    const runId = crypto.randomUUID();
    console.log(`Starting RSS ingestion run: ${runId}`);

    // Helper function to log errors to database
    async function logError(sourceId: string, sourceName: string, errorMessage: string, httpStatus?: number) {
      try {
        await supabaseClient
          .from('feed_errors')
          .insert({
            source_id: sourceId,
            source_name: sourceName,
            run_id: runId,
            error_message: errorMessage,
            http_status: httpStatus
          });
        console.log(`Logged error for source ${sourceId}: ${errorMessage}`);
      } catch (logError) {
        console.error('Failed to log error to database:', logError);
      }
    }

    // Fetch active news sources
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('news_sources')
      .select('*')
      .eq('is_active', true)

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`)
    }

    console.log(`Processing ${sources.length} news sources in batches`)

    let totalProcessed = 0;
    let totalNew = 0;
    let successCount = 0;
    let errorCount = 0;

    // Process sources in batches to avoid CPU timeout
    const BATCH_SIZE = 20;
    const allResults: Array<{ success: boolean; processed: number; newItems: number }> = [];

    for (let i = 0; i < sources.length; i += BATCH_SIZE) {
      const batch = sources.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(sources.length / BATCH_SIZE)} (${batch.length} sources)`);

      // Process this batch in parallel
      const batchPromises = batch.map(async (source) => {
      try {
        console.log(`Processing RSS feed: ${source.name}`)
        
        // Add timeout and better headers
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(source.rss_feed_url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0; +https://hinterlander.ca)',
            'Accept': 'application/rss+xml, application/xml, text/xml',
            'Cache-Control': 'no-cache'
          }
        })

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          console.error(`Failed to fetch ${source.name}: ${errorMessage}`);
          await logError(source.id, source.name, errorMessage, response.status);
          return { success: false, processed: 0, newItems: 0 };
        }

        const rssText = await response.text()
        
        // Validate that we got some content
        if (!rssText || rssText.trim().length === 0) {
          const errorMessage = 'Empty response from RSS feed';
          console.error(`${source.name}: ${errorMessage}`);
          await logError(source.id, source.name, errorMessage);
          return { success: false, processed: 0, newItems: 0 };
        }
        
        const rssItems = parseRSS(rssText)
        
        // Check if we successfully parsed items
        if (rssItems.length === 0) {
          const errorMessage = 'No valid RSS items found in feed (possible XML parsing error)';
          console.error(`${source.name}: ${errorMessage}`);
          await logError(source.id, source.name, errorMessage);
          return { success: false, processed: 0, newItems: 0 };
        }
        
        console.log(`Found ${rssItems.length} items from ${source.name}`)

        let sourceNewItems = 0;

        // Process each RSS item with deduplication
        for (const item of rssItems) {
          const canonicalUrl = cleanUrl(item.link)
          const publishedDate = parseDate(item.pubDate)
          
          // Check if link already exists
          const { data: existingLink, error: linkQueryError } = await supabaseClient
            .from('links')
            .select('id')
            .eq('canonical_url', canonicalUrl)
            .maybeSingle()
          
          if (linkQueryError) {
            console.error(`Error querying existing link: ${linkQueryError.message}`)
            continue
          }
          
          let linkId: string
          
          if (existingLink) {
            // Update last_seen_at for existing link
            const { error: updateError } = await supabaseClient
              .from('links')
              .update({ last_seen_at: new Date().toISOString() })
              .eq('id', existingLink.id)
            
            if (updateError) {
              console.error(`Error updating link: ${updateError.message}`)
              continue
            }
            
            linkId = existingLink.id
          } else {
            // Create new link
            const linkData = {
              canonical_url: canonicalUrl,
              title: cleanText(item.title),
              summary: cleanText(item.description),
              published_at: publishedDate,
              image_url: extractImageUrl(item.description)
            }
            
            const { data: newLink, error: insertError } = await supabaseClient
              .from('links')
              .insert(linkData)
              .select('id')
              .single()
            
            if (insertError || !newLink) {
              console.error(`Error inserting link: ${insertError?.message}`)
              continue
            }
            
            linkId = newLink.id
            sourceNewItems++
          }
          
          // Now handle the link_sources relationship
          const category = categorizeNews(item, source)
          
          const { error: linkSourceError } = await supabaseClient
            .from('link_sources')
            .upsert({
              link_id: linkId,
              source_id: source.id,
              category,
              last_seen_at: new Date().toISOString()
            }, {
              onConflict: 'link_id,source_id'
            })
          
          if (linkSourceError) {
            console.error(`Error upserting link_source: ${linkSourceError.message}`)
          }
        }

        // Update last fetched timestamp
        await supabaseClient
          .from('news_sources')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', source.id)

        return { success: true, processed: rssItems.length, newItems: sourceNewItems };

      } catch (error) {
        let errorMessage = '';
        const err = error as any; // Type assertion for error handling
        
        if (err.name === 'AbortError') {
          errorMessage = 'Request timeout (30 seconds)';
          console.error(`Timeout processing ${source.name}`);
        } else if (err.message?.includes('HTTP/2')) {
          errorMessage = `HTTP/2 protocol error: ${err.message}`;
          console.error(`HTTP/2 error processing ${source.name}:`, error);
        } else {
          errorMessage = `Unexpected error: ${err.message || err.toString()}`;
          console.error(`Error processing ${source.name}:`, error);
        }
        
        await logError(source.id, source.name, errorMessage);
        return { success: false, processed: 0, newItems: 0 };
      }
    });

      // Wait for this batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Aggregate batch results
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          allResults.push(result.value);
        } else {
          allResults.push({ success: false, processed: 0, newItems: 0 });
          console.error('Promise rejected:', result.reason);
        }
      });

      console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1} complete`);
    }
    
    // Aggregate all results
    allResults.forEach((result) => {
      const { success, processed, newItems } = result;
      if (success) {
        successCount++;
        totalProcessed += processed;
        totalNew += newItems;
      } else {
        errorCount++;
      }
    })

    console.log(`RSS Processing complete: ${successCount} successful, ${errorCount} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${totalProcessed} items, ${totalNew} new/updated`,
        sources_processed: sources.length,
        successful: successCount,
        failed: errorCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('RSS processing error:', error)
    const err = error as any; // Type assertion for error handling
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function parseRSS(xmlText: string): RSSItem[] {
  const items: RSSItem[] = []
  
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      ignoreDeclaration: true,
      parseAttributeValue: false,
      trimValues: true,
      cdataPropName: '__cdata'
    })
    
    const parsed = parser.parse(xmlText)
    
    // Handle RSS 2.0 format
    if (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) {
      const rssItems = Array.isArray(parsed.rss.channel.item) 
        ? parsed.rss.channel.item 
        : [parsed.rss.channel.item]
      
      for (const item of rssItems) {
        // Extract title (handle CDATA)
        const title = item.title?.__cdata || item.title?.['#text'] || item.title || ''
        
        // Extract link
        const link = item.link?.__cdata || item.link?.['#text'] || item.link || ''
        
        // Extract description (handle CDATA)
        const description = item.description?.__cdata || item.description?.['#text'] || item.description || ''
        
        // Extract pubDate
        const pubDate = item.pubDate?.__cdata || item.pubDate?.['#text'] || item.pubDate || ''
        
        // Extract guid
        const guid = item.guid?.__cdata || item.guid?.['#text'] || item.guid || undefined
        
        // Extract category
        const category = item.category?.__cdata || item.category?.['#text'] || item.category || undefined
        
        if (title && link) {
          items.push({
            title,
            link,
            description,
            pubDate,
            guid,
            category
          })
        }
      }
    }
    
    // Handle Atom format
    else if (parsed.feed && parsed.feed.entry) {
      const atomEntries = Array.isArray(parsed.feed.entry) 
        ? parsed.feed.entry 
        : [parsed.feed.entry]
      
      for (const entry of atomEntries) {
        // Extract title
        const title = entry.title?.__cdata || entry.title?.['#text'] || entry.title || ''
        
        // Extract link (Atom uses link element with href attribute)
        let link = ''
        if (entry.link) {
          if (Array.isArray(entry.link)) {
            const htmlLink = entry.link.find((l: any) => l['@_type'] === 'text/html' || l['@_rel'] === 'alternate')
            link = htmlLink?.['@_href'] || entry.link[0]?.['@_href'] || ''
          } else {
            link = entry.link?.['@_href'] || entry.link?.['#text'] || entry.link || ''
          }
        }
        
        // Extract description (summary or content in Atom)
        const description = entry.summary?.__cdata || entry.summary?.['#text'] || entry.summary || 
                          entry.content?.__cdata || entry.content?.['#text'] || entry.content || ''
        
        // Extract pubDate (published or updated in Atom)
        const pubDate = entry.published || entry.updated || ''
        
        // Extract guid (id in Atom)
        const guid = entry.id || undefined
        
        // Extract category
        const category = entry.category?.['@_term'] || entry.category?.['#text'] || entry.category || undefined
        
        if (title && link) {
          items.push({
            title,
            link,
            description,
            pubDate,
            guid,
            category
          })
        }
      }
    }
  } catch (error) {
    console.error('XML parsing error:', error)
  }
  
  return items
}

function cleanText(text: any): string {
  if (!text) return ''
  
  // Handle different types of input
  let str = ''
  if (typeof text === 'string') {
    str = text
  } else if (typeof text === 'object') {
    // Try common RSS feed object properties
    str = text.content || text._ || text['#text'] || JSON.stringify(text)
  } else {
    str = String(text)
  }
  
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities (simplified)
    .trim()
    .substring(0, 500) // Limit length
}

function parseDate(dateString: string): string {
  if (!dateString) return new Date().toISOString()
  
  try {
    const date = new Date(dateString)
    return date.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function categorizeNews(item: RSSItem, source: NewsSource): string {
  const title = (item.title || '').toLowerCase()
  const description = (item.description || '').toLowerCase()
  const text = `${title} ${description}`

  // Rural/Agriculture keywords
  if (/\b(farm|agriculture|rural|crop|livestock|grain|beef|dairy|wheat)\b/.test(text)) {
    return 'Rural'
  }

  // Opinion keywords
  if (source.name.includes('Line') ||
      /\b(opinion|editorial|commentary|analysis|column)\b/.test(text)) {
    return 'Opinion'
  }

  // Provincial keywords (check for province names)
  if (/\b(ontario|quebec|british columbia|alberta|manitoba|saskatchewan|nova scotia|new brunswick|newfoundland|prince edward island|toronto|montreal|vancouver|calgary|winnipeg|halifax)\b/.test(text)) {
    return 'Provincial'
  }

  // Use source's default category
  return source.category
}

function extractImageUrl(description: string): string | null {
  if (!description) return null
  
  const imgRegex = /<img[^>]+src="([^"]+)"/i
  const match = imgRegex.exec(description)
  return match ? match[1] : null
}

function cleanUrl(url: string): string {
  if (!url) return ''
  
  try {
    const urlObj = new URL(url)
    
    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid',
      '_ga', '_gl', 'ref', 'source', 'campaign'
    ]
    
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param)
    })
    
    // Normalize the URL
    let cleanedUrl = urlObj.toString()
    
    // Remove trailing slash for consistency (except for root paths)
    if (cleanedUrl.endsWith('/') && cleanedUrl !== urlObj.origin + '/') {
      cleanedUrl = cleanedUrl.slice(0, -1)
    }
    
    return cleanedUrl.toLowerCase()
  } catch {
    // If URL parsing fails, return original URL cleaned up
    return url.trim().toLowerCase()
  }
}
