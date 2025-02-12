import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabaseClient } from '@/integrations/supabase/client.ts'

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
      part: 'id,statistics,contentDetails',
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
        part: 'statistics,contentDetails',
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

    // Get channel statistics and content details
    const statsParams = new URLSearchParams({
      part: 'statistics,contentDetails',
      id: channelId,
      key: apiKey,
    })

    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?${statsParams.toString()}`
    const statsResponse = await fetch(statsUrl)
    channelData = await statsResponse.json()

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

    // Fetch playlist items to calculate total duration
    const playlistId = channelData.items[0].contentDetails.relatedPlaylists.uploads
    const playlistParams = new URLSearchParams({
      part: 'contentDetails',
      playlistId: playlistId,
      maxResults: '50',
      key: apiKey,
    })

    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?${playlistParams.toString()}`
    const playlistResponse = await fetch(playlistUrl)
    const playlistData = await playlistResponse.json()

    if (!playlistResponse.ok) {
      console.error('Playlist fetch failed:', playlistData)
      throw new Error('Failed to fetch playlist data')
    }

    // Get video durations
    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',')
    const videosParams = new URLSearchParams({
      part: 'contentDetails,statistics',
      id: videoIds,
      key: apiKey,
    })

    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?${videosParams.toString()}`
    const videosResponse = await fetch(videosUrl)
    const videosData = await videosResponse.json()

    if (!videosResponse.ok) {
      console.error('Videos fetch failed:', videosData)
      throw new Error('Failed to fetch videos data')
    }

    // Calculate total watch time
    let totalWatchTimeHours = 0
    videosData.items.forEach((video: any) => {
      const duration = video.contentDetails.duration
      const viewCount = parseInt(video.statistics.viewCount)
      
      // Convert ISO 8601 duration to hours
      const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
      const hours = parseInt(matches[1] || '0')
      const minutes = parseInt(matches[2] || '0')
      const seconds = parseInt(matches[3] || '0')
      
      const durationHours = hours + minutes/60 + seconds/3600
      totalWatchTimeHours += durationHours * viewCount
    })

    const channelStats = channelData.items[0].statistics
    const currentDate = new Date().toISOString().split('T')[0]

    // Save stats to the database
    const { error: insertError } = await supabaseClient
      .from('youtube_stats_history')
      .upsert({
        date: currentDate,
        subscriber_count: parseInt(channelStats.subscriberCount),
        view_count: parseInt(channelStats.viewCount),
        video_count: parseInt(channelStats.videoCount),
        watch_time_hours: Math.round(totalWatchTimeHours)
      })

    if (insertError) {
      console.error('Error saving stats to database:', insertError)
    }

    // Fetch historical data (last 30 days)
    const { data: historyData, error: historyError } = await supabaseClient
      .from('youtube_stats_history')
      .select('*')
      .order('date', { ascending: true })
      .limit(30)

    if (historyError) {
      console.error('Error fetching history:', historyError)
    }

    return new Response(
      JSON.stringify({
        currentStats: {
          subscriberCount: channelStats.subscriberCount,
          viewCount: channelStats.viewCount,
          videoCount: channelStats.videoCount,
          watchTimeHours: Math.round(totalWatchTimeHours),
          timestamp: new Date().toISOString()
        },
        history: historyData || []
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
