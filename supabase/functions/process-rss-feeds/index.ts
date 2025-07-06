
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
  type: string;
  rss_url: string;
  tags: string[];
}

serve(async (req) => {
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

    for (const source of sources as NewsSource[]) {
      try {
        console.log(`Processing RSS feed: ${source.name}`)
        
        // Fetch RSS feed
        const response = await fetch(source.rss_url, {
          headers: {
            'User-Agent': 'Hinterlander RSS Aggregator 1.0'
          }
        })

        if (!response.ok) {
          console.error(`Failed to fetch ${source.name}: ${response.status}`)
          continue
        }

        const rssText = await response.text()
        const rssItems = parseRSS(rssText)
        
        console.log(`Found ${rssItems.length} items from ${source.name}`)

        // Process each RSS item
        for (const item of rssItems) {
          const newsItem = {
            external_id: item.guid || item.link || `${source.id}-${Date.now()}`,
            title: cleanText(item.title),
            summary: cleanText(item.description),
            source: source.name,
            source_id: source.id,
            published_at: parseDate(item.pubDate),
            category: categorizeNews(item, source),
            url: item.link,
            image_url: extractImageUrl(item.description)
          }

          // Insert or update news item
          const { error: insertError } = await supabaseClient
            .from('news_items')
            .upsert(newsItem, {
              onConflict: 'external_id,source_id'
            })

          if (!insertError) {
            totalNew++
          }
        }

        totalProcessed += rssItems.length

        // Update last fetched timestamp
        await supabaseClient
          .from('news_sources')
          .update({ last_fetched_at: new Date().toISOString() })
          .eq('id', source.id)

      } catch (error) {
        console.error(`Error processing ${source.name}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${totalProcessed} items, ${totalNew} new/updated`,
        sources_processed: sources.length
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('RSS processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
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
  if (source.tags.includes('rural') || source.tags.includes('agriculture') ||
      /\b(farm|agriculture|rural|crop|livestock|grain|beef|dairy|wheat)\b/.test(text)) {
    return 'Rural'
  }

  // Opinion keywords
  if (source.tags.includes('opinion') || source.name.includes('Line') ||
      /\b(opinion|editorial|commentary|analysis|column)\b/.test(text)) {
    return 'Opinion'
  }

  // Provincial keywords (check for province names)
  if (source.tags.some(tag => ['ontario', 'quebec', 'british-columbia', 'alberta', 'manitoba', 'saskatchewan', 'nova-scotia', 'new-brunswick', 'newfoundland', 'prince-edward-island'].includes(tag)) ||
      /\b(ontario|quebec|british columbia|alberta|manitoba|saskatchewan|nova scotia|new brunswick|newfoundland|prince edward island|toronto|montreal|vancouver|calgary|winnipeg|halifax)\b/.test(text)) {
    return 'Provincial'
  }

  // Default to National
  return 'National'
}

function extractImageUrl(description: string): string | null {
  if (!description) return null
  
  const imgRegex = /<img[^>]+src="([^"]+)"/i
  const match = imgRegex.exec(description)
  return match ? match[1] : null
}
