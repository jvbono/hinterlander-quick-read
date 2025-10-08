import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting RSS feed processing with 3-step pipeline...')

    // Fetch active sources
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('*')
      .eq('is_active', true)

    if (sourcesError) throw sourcesError
    console.log(`Found ${sources.length} active sources`)

    // STEP 1: Fetch & Store Raw Items
    const rawInsertResults = await fetchAndStoreRaw(supabase, sources)
    
    // STEP 2: Process Raw Items → Articles
    const processResults = await processRawItems(supabase)

    return new Response(
      JSON.stringify({
        success: true,
        sources_processed: sources.length,
        raw_items_inserted: rawInsertResults.inserted,
        articles_created: processResults.created,
        articles_updated: processResults.updated,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing RSS feeds:', error)
    const err = error as any
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// STEP 1: Fetch RSS feeds and store raw JSON
async function fetchAndStoreRaw(supabase: any, sources: any[]) {
  let inserted = 0
  const parser = new XMLParser({ 
    ignoreAttributes: false, 
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    ignoreDeclaration: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataPropName: '__cdata'
  })

  for (const source of sources) {
    console.log(`Fetching ${source.name}...`)
    
    // Create fetch log
    const { data: logData, error: logError } = await supabase
      .from('fetch_logs')
      .insert({ source_id: source.id, ok: false })
      .select()
      .single()

    if (logError) {
      console.error(`Failed to create log for ${source.name}:`, logError)
      continue
    }

    const logId = logData.id

    try {
      let response: Response | null = null
      let lastError: any = null
      const maxRetries = 2
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000)

          response = await fetch(source.rss_url, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate',
              'Cache-Control': 'no-cache',
            }
          })

          clearTimeout(timeoutId)
          break // Success
          
        } catch (fetchError: any) {
          lastError = fetchError
          console.log(`Fetch attempt ${attempt + 1} failed for ${source.name}:`, fetchError.message)
          
          if (attempt < maxRetries && fetchError.message?.includes('http2')) {
            console.log(`Retrying ${source.name} due to HTTP/2 error...`)
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
            continue
          }
          
          throw fetchError
        }
      }
      
      if (!response) {
        throw lastError || new Error('Failed to fetch after retries')
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const xmlText = await response.text()
      
      if (!xmlText || xmlText.trim().length === 0) {
        throw new Error('Empty response from RSS feed')
      }
      
      const parsed = parser.parse(xmlText)
      
      // Handle both RSS and Atom feeds
      let items = []
      if (parsed.rss?.channel?.item) {
        items = Array.isArray(parsed.rss.channel.item) ? parsed.rss.channel.item : [parsed.rss.channel.item]
      } else if (parsed.feed?.entry) {
        items = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry]
      }

      if (items.length === 0) {
        throw new Error('No valid RSS items found in feed')
      }

      console.log(`Parsed ${items.length} items from ${source.name}`)

      // Insert raw items in bulk
      const rawItems = items.map(item => ({
        source_id: source.id,
        item_json: item
      }))

      if (rawItems.length > 0) {
        const { error: insertError } = await supabase
          .from('raw_items')
          .insert(rawItems)

        if (!insertError) {
          inserted += rawItems.length
        } else {
          console.error(`Error inserting raw items for ${source.name}:`, insertError)
        }
      }

      // Update fetch log - success
      await supabase
        .from('fetch_logs')
        .update({ 
          finished_at: new Date().toISOString(),
          ok: true,
          http_status: response.status
        })
        .eq('id', logId)

      // Update source last_seen_at
      await supabase
        .from('sources')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', source.id)

    } catch (error) {
      const err = error as any
      console.error(`Error fetching ${source.name}:`, err.message)
      
      // Log error
      await supabase.from('feed_errors').insert({
        source_id: source.id,
        source_name: source.name,
        error_message: err.message,
        http_status: null
      })

      // Update fetch log - failure
      await supabase
        .from('fetch_logs')
        .update({ 
          finished_at: new Date().toISOString(),
          ok: false,
          error: err.message
        })
        .eq('id', logId)
    }
  }

  return { inserted }
}

// STEP 2: Process raw items into canonical articles
async function processRawItems(supabase: any) {
  let created = 0
  let updated = 0

  // Get recent unprocessed raw items (last 24 hours)
  const { data: rawItems, error: rawError } = await supabase
    .from('raw_items')
    .select('id, source_id, item_json, sources(id, name, default_target, tags)')
    .gte('fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1000)

  if (rawError) throw rawError
  console.log(`Processing ${rawItems.length} raw items...`)

  // Fetch mapping rules
  const { data: mappingRules } = await supabase
    .from('mapping_rules')
    .select('*')

  const regionRules = mappingRules?.filter((r: any) => r.target_enum === 'region') || []
  const categoryRules = mappingRules?.filter((r: any) => r.target_enum === 'category') || []

  for (const raw of rawItems) {
    try {
      const item = raw.item_json
      const source = raw.sources

      // Extract title
      const title = extractText(item.title) || extractText(item['title:']) || ''
      
      // Extract link
      let link = ''
      if (item.link) {
        if (typeof item.link === 'string') {
          link = item.link
        } else if (Array.isArray(item.link)) {
          const htmlLink = item.link.find((l: any) => l['@_type'] === 'text/html' || l['@_rel'] === 'alternate')
          link = htmlLink?.['@_href'] || item.link[0]?.['@_href'] || ''
        } else {
          link = item.link?.['@_href'] || item.link?.['#text'] || ''
        }
      }
      link = link || item.guid || item.id || ''
      
      // Extract description
      const description = extractText(item.description) || 
                         extractText(item.summary) || 
                         extractText(item.content) || ''
      
      // Extract pubDate
      const pubDate = parseDate(item.pubDate || item.published || item.updated || new Date().toISOString())
      
      // Extract author
      const author = extractText(item.author) || extractText(item['dc:creator']) || null
      
      // Extract image
      const imageUrl = extractImageUrl(item) || null

      if (!title || !link) continue

      // Clean URL and compute hash
      const canonicalUrl = cleanUrl(link)
      const urlHash = await hashString(canonicalUrl)

      // Apply tagging
      const fullText = `${title} ${description} ${link}`
      const regions = applyMappingRules(regionRules, fullText)
      const categories = applyMappingRules(categoryRules, fullText)

      // Determine target column
      const targetColumn = classifyArticle(item, source, link)

      // Prepare article data
      const articleData = {
        source_id: source?.id || raw.source_id,
        title: title.substring(0, 500),
        canonical_url: canonicalUrl,
        description: description ? description.substring(0, 2000) : null,
        author,
        image_url: imageUrl,
        published_at: pubDate,
        target_column: targetColumn,
        categories,
        regions,
        url_hash: urlHash,
        status: 'ready',
        lang: 'en'
      }

      // Check if article exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('url_hash', urlHash)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('articles')
          .update(articleData)
          .eq('id', existing.id)
        updated++
      } else {
        await supabase
          .from('articles')
          .insert(articleData)
        created++
      }

    } catch (error) {
      const err = error as any
      console.error('Error processing raw item:', err.message)
    }
  }

  return { created, updated }
}

// Helper functions
function extractText(obj: any): string {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj.__cdata || obj['#text'] || obj.content || obj._ || ''
}

function applyMappingRules(rules: any[], text: string): string[] {
  const lowerText = text.toLowerCase()
  const matches = new Set<string>()

  for (const rule of rules) {
    try {
      const regex = new RegExp(rule.pattern, 'i')
      if (regex.test(lowerText)) {
        matches.add(rule.slug)
      }
    } catch (error) {
      console.error(`Invalid regex pattern: ${rule.pattern}`)
    }
  }

  return Array.from(matches)
}

function classifyArticle(item: any, source: any, url: string): 'news' | 'commentary' | 'currents' {
  const urlLower = url.toLowerCase()
  const title = extractText(item.title).toLowerCase()

  // Check URL patterns for commentary/opinion
  if (urlLower.includes('/opinion') || urlLower.includes('/commentary') || 
      urlLower.includes('/editorial') || urlLower.includes('/column')) {
    return 'commentary'
  }

  // Check for podcast/audio content (currents)
  if (urlLower.includes('/podcast') || urlLower.includes('/audio') ||
      title.includes('podcast') || item.enclosure) {
    return 'currents'
  }

  // Default to source's default target
  return source?.default_target || 'news'
}

function parseDate(dateString: string): string {
  try {
    return new Date(dateString).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

function extractImageUrl(item: any): string | null {
  if (item['media:content']?.['@_url']) return item['media:content']['@_url']
  if (item['media:thumbnail']?.['@_url']) return item['media:thumbnail']['@_url']
  if (item.enclosure?.['@_url']) return item.enclosure['@_url']
  
  // Try to extract from description HTML
  const desc = extractText(item.description)
  if (desc) {
    const imgRegex = /<img[^>]+src="([^"]+)"/i
    const match = imgRegex.exec(desc)
    if (match) return match[1]
  }
  
  return null
}

function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // Remove tracking params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'ref']
    trackingParams.forEach(param => urlObj.searchParams.delete(param))
    return urlObj.toString().replace(/\/$/, '')
  } catch {
    return url.replace(/\/$/, '')
  }
}

async function hashString(str: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return new Uint8Array(hashBuffer)
}
