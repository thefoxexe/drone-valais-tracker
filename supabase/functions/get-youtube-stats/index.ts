
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY')
    console.log('YouTube API key exists:', !!apiKey)
    
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

    // On utilise le handle de la chaîne YouTube
    const searchParams = new URLSearchParams({
      part: 'id,statistics',
      forUsername: 'dronevalais',
      key: apiKey,
    })

    const url = `https://www.googleapis.com/youtube/v3/channels?${searchParams.toString()}`
    console.log('Fetching channel stats:', url.replace(apiKey, 'REDACTED'))

    const response = await fetch(url)
    let channelData = await response.json()
    console.log('API Response:', JSON.stringify(channelData, null, 2))

    if (!response.ok) {
      console.error('API error:', channelData)
      return new Response(
        JSON.stringify({
          error: 'API Error',
          details: channelData.error?.message || 'Unknown error',
          timestamp: new Date().toISOString(),
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Si on ne trouve pas avec le username, essayons avec une recherche
    if (!channelData.items || channelData.items.length === 0) {
      console.log('No channel found with username, trying search...')
      const searchChannelParams = new URLSearchParams({
        part: 'id',
        q: 'Drone Valais',
        type: 'channel',
        key: apiKey,
      })

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?${searchChannelParams.toString()}`
      console.log('Searching for channel:', searchUrl.replace(apiKey, 'REDACTED'))

      const searchResponse = await fetch(searchUrl)
      const searchData = await searchResponse.json()
      console.log('Search Response:', JSON.stringify(searchData, null, 2))

      if (!searchResponse.ok || !searchData.items || searchData.items.length === 0) {
        console.error('Search failed:', searchData)
        return new Response(
          JSON.stringify({
            error: 'Channel not found',
            details: 'Could not find the channel',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Utilisons l'ID trouvé pour obtenir les statistiques
      const channelId = searchData.items[0].id.channelId
      const statsParams = new URLSearchParams({
        part: 'statistics',
        id: channelId,
        key: apiKey,
      })

      const statsUrl = `https://www.googleapis.com/youtube/v3/channels?${statsParams.toString()}`
      console.log('Fetching stats for found channel:', statsUrl.replace(apiKey, 'REDACTED'))

      const statsResponse = await fetch(statsUrl)
      channelData = await statsResponse.json()
      console.log('Stats Response:', JSON.stringify(channelData, null, 2))

      if (!statsResponse.ok || !channelData.items || channelData.items.length === 0) {
        console.error('Stats fetch failed:', channelData)
        return new Response(
          JSON.stringify({
            error: 'Statistics not found',
            details: 'Could not fetch channel statistics',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    const channelStats = channelData.items[0].statistics
    console.log('Returning channel stats:', channelStats)

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
