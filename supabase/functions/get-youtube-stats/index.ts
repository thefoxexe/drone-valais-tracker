
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CHANNEL_ID = 'UCU5gptyRV8IU2hkD0JzHkgw' // ID de la chaîne Drone Valais

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    if (!apiKey) {
      console.error('YouTube API key not found')
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'YouTube API key not found',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Build URL with proper encoding
    const params = new URLSearchParams({
      part: 'statistics',
      id: CHANNEL_ID,
      key: apiKey,
    })

    const url = `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`
    console.log('Fetching YouTube stats from:', url.replace(apiKey, 'REDACTED'))

    const response = await fetch(url)
    const responseText = await response.text()
    console.log('Raw YouTube API response:', responseText)

    if (!response.ok) {
      console.error('YouTube API error:', responseText)
      return new Response(
        JSON.stringify({
          error: 'YouTube API error',
          details: responseText,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const data = JSON.parse(responseText)
    console.log('Parsed response:', JSON.stringify(data, null, 2))

    // Validate response structure
    if (!data.items || !Array.isArray(data.items)) {
      console.error('Invalid response format - missing items array:', data)
      return new Response(
        JSON.stringify({
          error: 'Invalid response format',
          details: 'Response missing items array',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (data.items.length === 0) {
      console.error('No channel found for ID:', CHANNEL_ID)
      return new Response(
        JSON.stringify({
          error: 'Channel not found',
          details: `No data found for channel ID: ${CHANNEL_ID}`,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const channelStats = data.items[0].statistics
    if (!channelStats) {
      console.error('Missing statistics in response:', data.items[0])
      return new Response(
        JSON.stringify({
          error: 'Invalid response format',
          details: 'Channel statistics not found in response',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        subscriberCount: channelStats.subscriberCount,
        viewCount: channelStats.viewCount,
        videoCount: channelStats.videoCount,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in get-youtube-stats:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
