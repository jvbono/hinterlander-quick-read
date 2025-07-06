
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    console.log('Starting scheduled RSS update...')
    
    // Call the RSS processing function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-rss-feeds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    
    console.log('Scheduled RSS update completed:', result)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduled RSS update completed successfully',
        details: result
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Scheduled RSS update error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
