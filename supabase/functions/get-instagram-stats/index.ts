
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Pour le moment, nous retournons des données statiques pour tester l'interface
    const mockData = {
      username: "dronevalaisproduction",
      biography: "Drone Valais Production • Vidéos par drone en Valais 🎥🚁",
      profilePicture: "https://picsum.photos/200", // Image temporaire
      followersCount: 1250,
      followingCount: 850,
      mediaCount: 125,
      historicalData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        followers_count: 1200 + Math.floor(Math.random() * 100),
        media_count: 120 + Math.floor(i / 3)
      })),
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(mockData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in get-instagram-stats function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
