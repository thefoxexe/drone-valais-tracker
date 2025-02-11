
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

    // Utilisons directement l'ID de la chaîne pour éviter les problèmes avec le handle
    const channelId = 'UCbewPcoO8m_vBF0UtZHiMIQ' // ID de la chaîne Drone Valais
    const statsParams = new URLSearchParams({
      part: 'statistics',
      id: channelId,
      key: apiKey,
    })

    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?${statsParams.toString()}`
    console.log('Fetching channel stats:', statsUrl.replace(apiKey, 'REDACTED'))

    const statsResponse = await fetch(statsUrl)
    const statsData = await statsResponse.json()
    console.log('Channel stats response:', JSON.stringify(statsData, null, 2))

    if (!statsResponse.ok || !statsData.items || statsData.items.length === 0) {
      console.error('Failed to get channel stats:', statsData)
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

    const channelStats = statsData.items[0].statistics
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
