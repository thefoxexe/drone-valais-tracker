
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables')
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'Missing required environment variables',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Simulons des données pour l'instant
    const mockStats = {
      followerCount: 1234,
      followingCount: 567,
      mediaCount: 89,
      totalLikes: 5678
    }

    // Stockons ces données dans l'historique
    const { error: insertError } = await supabase
      .from('instagram_stats_history')
      .insert({
        follower_count: mockStats.followerCount,
        following_count: mockStats.followingCount,
        media_count: mockStats.mediaCount,
        total_likes: mockStats.totalLikes
      })

    if (insertError) {
      console.error('Error storing stats:', insertError)
    }

    // Récupérons l'historique des 30 derniers jours
    const { data: historicalData, error: fetchError } = await supabase
      .from('instagram_stats_history')
      .select('*')
      .order('date', { ascending: true })
      .limit(30)

    if (fetchError) {
      console.error('Error fetching historical data:', fetchError)
    }

    return new Response(
      JSON.stringify({
        followerCount: mockStats.followerCount,
        followingCount: mockStats.followingCount,
        mediaCount: mockStats.mediaCount,
        totalLikes: mockStats.totalLikes,
        historicalData: historicalData || [],
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in get-instagram-stats:', error)
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
