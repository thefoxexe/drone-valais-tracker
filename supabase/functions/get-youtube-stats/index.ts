import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

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

    let channelData
    let channelId

    // First try with channel search
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

    // Get channel ID from search results
    channelId = searchData.items[0].id.channelId

    // Get channel statistics
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

    // Fetch playlist items to calculate total duration
    const playlistId = channelData.items[0].contentDetails.relatedPlaylists.uploads
    const playlistParams = new URLSearchParams({
      part: 'contentDetails',
      playlistId: playlistId,
      maxResults: '50',
      key: apiKey,
    })

    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?${playlistParams.toString()}`
    console.log('Fetching playlist:', playlistUrl.replace(apiKey, 'REDACTED'))

    const playlistResponse = await fetch(playlistUrl)
    const playlistData = await playlistResponse.json()
    console.log('Playlist Response:', JSON.stringify(playlistData, null, 2))

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
    console.log('Fetching videos:', videosUrl.replace(apiKey, 'REDACTED'))

    const videosResponse = await fetch(videosUrl)
    const videosData = await videosResponse.json()
    console.log('Videos Response:', JSON.stringify(videosData, null, 2))

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

    console.log('Channel stats:', {
      subscriberCount: channelStats.subscriberCount,
      viewCount: channelStats.viewCount,
      videoCount: channelStats.videoCount,
      watchTimeHours: Math.round(totalWatchTimeHours)
    })

    // Save today's stats to the database
    const { error: insertError } = await supabaseClient
      .from('youtube_stats_history')
      .upsert({
        date: currentDate,
        subscriber_count: parseInt(channelStats.subscriberCount),
        view_count: parseInt(channelStats.viewCount),
        video_count: parseInt(channelStats.videoCount),
        watch_time_hours: Math.round(totalWatchTimeHours)
      }, {
        onConflict: 'date'
      })

    if (insertError) {
      console.error('Error saving stats to database:', insertError)
    }

    // Calculate date range for the last 12 months
    const today = new Date()
    const twelveMonthsAgo = new Date(today)
    twelveMonthsAgo.setMonth(today.getMonth() - 11) // -11 to include current month
    twelveMonthsAgo.setDate(1) // Start from the 1st of the month
    const startDate = twelveMonthsAgo.toISOString().split('T')[0]

    console.log('Fetching history from:', startDate, 'to:', currentDate)

    // Fetch historical data
    const { data: monthlyData, error: historyError } = await supabaseClient
      .from('youtube_stats_history')
      .select('*')
      .gte('date', startDate)
      .order('date', { ascending: true })

    if (historyError) {
      console.error('Error fetching history:', historyError)
      throw historyError
    }

    if (!monthlyData || monthlyData.length === 0) {
      console.log('No historical data found, using current stats')
      monthlyData = [{
        date: currentDate,
        subscriber_count: parseInt(channelStats.subscriberCount),
        view_count: parseInt(channelStats.viewCount),
        video_count: parseInt(channelStats.videoCount),
        watch_time_hours: Math.round(totalWatchTimeHours)
      }]
    }

    console.log('Retrieved history data:', monthlyData)

    // Aggregate data by month
    const monthlyAggregated = monthlyData.reduce((acc: Record<string, any>[], entry) => {
      const date = new Date(entry.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const existingMonth = acc.find(m => m.month === monthYear)
      if (existingMonth) {
        // Garder la valeur la plus récente pour le mois
        if (new Date(entry.date) > new Date(existingMonth.originalDate)) {
          existingMonth.view_count = entry.view_count
          existingMonth.originalDate = entry.date
        }
      } else {
        acc.push({
          month: monthYear,
          view_count: entry.view_count,
          originalDate: entry.date
        })
      }
      return acc
    }, [])

    console.log('Monthly aggregated data:', monthlyAggregated)

    // Remplir les mois manquants
    const allMonths = []
    const currentMonth = new Date(twelveMonthsAgo)
    
    while (currentMonth <= today) {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`
      const existingData = monthlyAggregated.find(m => m.month === monthStr)
      
      console.log('Processing month:', monthStr, 'Found data:', existingData)
      
      // Si pas de données pour ce mois, utiliser les données du mois précédent
      let viewCount = existingData?.view_count
      if (!viewCount && allMonths.length > 0) {
        viewCount = allMonths[allMonths.length - 1].view_count
      }
      // Si toujours pas de données (premier mois), utiliser les stats actuelles
      if (!viewCount) {
        viewCount = parseInt(channelStats.viewCount)
      }
      
      allMonths.push({
        month: monthStr,
        view_count: viewCount
      })
      
      currentMonth.setMonth(currentMonth.getMonth() + 1)
    }

    console.log('Final monthly data:', allMonths)

    return new Response(
      JSON.stringify({
        currentStats: {
          subscriberCount: channelStats.subscriberCount,
          viewCount: channelStats.viewCount,
          videoCount: channelStats.videoCount,
          watchTimeHours: Math.round(totalWatchTimeHours),
          timestamp: new Date().toISOString()
        },
        history: allMonths
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
