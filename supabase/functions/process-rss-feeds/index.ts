
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Fetch active news sources
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('news_sources')
      .select('*')
      .eq('is_active', true)

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`)
    }

    console.log(`Processing ${sources.length} news sources`)

    let totalProcessed = 0;
    let totalNew = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const source of sources as NewsSource[]) {
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
          console.error(`Failed to fetch ${source.name}: ${response.status} ${response.statusText}`)
          errorCount++
          continue
        }

        const rssText = await response.text()
        const rssItems = parseRSS(rssText)
        
        console.log(`Found ${rssItems.length} items from ${source.name}`)

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
            totalNew++
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

        totalProcessed += rssItems.length
        successCount++

        // Update last fetched timestamp
        await supabaseClient
          .from('news_sources')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', source.id)

      } catch (error) {
        if (error.name === 'AbortError') {
          console.error(`Timeout processing ${source.name}`)
        } else {
          console.error(`Error processing ${source.name}:`, error)
        }
        errorCount++
      }
    }

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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function parseRSS(xmlText: string): RSSItem[] {
  const items: RSSItem[] = []
  
  // Simple regex-based RSS parsing
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  const titleRegex = /<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>|<title[^>]*>(.*?)<\/title>/i
  const linkRegex = /<link[^>]*>(.*?)<\/link>/i
  const descRegex = /<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>|<description[^>]*>(.*?)<\/description>/i
  const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/i
  const guidRegex = /<guid[^>]*>(.*?)<\/guid>/i

  let match
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemXml = match[1]
    
    const titleMatch = titleRegex.exec(itemXml)
    const linkMatch = linkRegex.exec(itemXml)
    const descMatch = descRegex.exec(itemXml)
    const pubDateMatch = pubDateRegex.exec(itemXml)
    const guidMatch = guidRegex.exec(itemXml)

    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1] || titleMatch[2] || '',
        link: linkMatch[1] || '',
        description: descMatch ? (descMatch[1] || descMatch[2] || '') : '',
        pubDate: pubDateMatch ? pubDateMatch[1] : '',
        guid: guidMatch ? guidMatch[1] : undefined
      })
    }
  }

  return items
}

function cleanText(text: string): string {
  if (!text) return ''
  return text
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
  const title = item.title.toLowerCase()
  const description = item.description.toLowerCase()
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
