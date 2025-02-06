import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CHANNEL_ID = 'UCgc5uNXZgX2zB6PiH_4Y1Eg' // @DroneValais channel ID

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

    console.log('Fetching YouTube stats for channel:', CHANNEL_ID)
    console.log('API Key exists:', !!YOUTUBE_API_KEY)

    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${YOUTUBE_API_KEY}`
    console.log('Request URL:', url)

    const response = await fetch(url)
    const data = await response.json()
    
    console.log('YouTube API response status:', response.status)
    console.log('YouTube API response:', JSON.stringify(data, null, 2))

    if (!data.items || data.items.length === 0) {
      console.error('No items found in response:', data)
      throw new Error(data.error?.message || 'No channel data found')
    }

    const stats = data.items[0].statistics
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
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})