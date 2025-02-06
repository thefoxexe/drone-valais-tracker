import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @DroneValais channel ID
const CHANNEL_ID = 'UCgc5uNXZgX2zB6PiH_4Y1Eg'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
    if (!YOUTUBE_API_KEY) {
      console.error('Missing YouTube API key')
      throw new Error('Missing YouTube API key')
    }

    console.log('Starting YouTube stats fetch...')
    console.log('Channel ID:', CHANNEL_ID)
    console.log('API Key exists:', !!YOUTUBE_API_KEY)

    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
    
    // Fetch with error handling
    let response
    try {
      response = await fetch(url)
      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('YouTube API error response:', errorText)
        throw new Error(`YouTube API returned ${response.status}: ${errorText}`)
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      throw new Error(`Failed to fetch from YouTube API: ${fetchError.message}`)
    }

    // Parse response
    let data
    try {
      data = await response.json()
      console.log('YouTube API response:', JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Failed to parse YouTube API response')
    }

    // Validate response data
    if (!data.items) {
      console.error('No items array in response:', data)
      throw new Error('Invalid YouTube API response format')
    }

    if (data.items.length === 0) {
      console.error('Empty items array:', data)
      throw new Error('Channel not found')
    }

    const stats = data.items[0].statistics
    if (!stats) {
      console.error('No statistics in response:', data.items[0])
      throw new Error('No statistics available for channel')
    }

    return new Response(
      JSON.stringify({
        viewCount: stats.viewCount,
        subscriberCount: stats.subscriberCount,
        videoCount: stats.videoCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in get-youtube-stats:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})