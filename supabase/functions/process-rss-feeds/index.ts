
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
            'User-Agent': 'Mozilla/5.0 (compatible; HinterlanderBot/1.0)',
            'Accept': 'application/rss+xml, application/xml, text/xml'
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

        // Process each RSS item
        for (const item of rssItems) {
          const newsItem = {
            title: cleanText(item.title),
            summary: cleanText(item.description),
            source: source.name,
            published_at: parseDate(item.pubDate),
            category: categorizeNews(item, source),
            url: item.link,
            image_url: extractImageUrl(item.description)
          }

          // Insert news item with upsert to handle duplicates
          const { error: insertError } = await supabaseClient
            .from('news_items')
            .upsert(newsItem, { 
              onConflict: 'url',
              ignoreDuplicates: true 
            })

          if (!insertError) {
            totalNew++
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
