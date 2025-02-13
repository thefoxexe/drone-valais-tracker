
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

    // Récupérer les dernières statistiques
    const { data: latestStats, error: latestError } = await supabase
      .from('instagram_stats_history')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (latestError) {
      console.error('Error fetching latest stats:', latestError)
      throw latestError
    }

    // Récupérer l'historique des 30 derniers jours
    const { data: historicalData, error: fetchError } = await supabase
      .from('instagram_stats_history')
      .select('*')
      .order('date', { ascending: true })
      .limit(30)

    if (fetchError) {
      console.error('Error fetching historical data:', fetchError)
      throw fetchError
    }

    return new Response(
      JSON.stringify({
        followerCount: latestStats?.follower_count || 0,
        followingCount: latestStats?.following_count || 0,
        mediaCount: latestStats?.media_count || 0,
        totalLikes: latestStats?.total_likes || 0,
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
