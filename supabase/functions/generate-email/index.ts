import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receivedEmail, intention } = await req.json();

    let systemPrompt = "Tu es un assistant professionnel qui aide à rédiger des réponses d'emails en français. ";
    
    switch (intention) {
      case "accept":
        systemPrompt += "Tu dois rédiger une réponse positive et professionnelle pour accepter la proposition.";
        break;
      case "decline":
        systemPrompt += "Tu dois rédiger un refus poli et professionnel tout en maintenant de bonnes relations.";
        break;
      case "more_info":
        systemPrompt += "Tu dois demander plus d'informations de manière professionnelle et précise.";
        break;
      case "negotiate":
        systemPrompt += "Tu dois négocier les conditions de manière professionnelle et constructive.";
        break;
      case "follow_up":
        systemPrompt += "Tu dois faire un suivi professionnel et courtois.";
        break;
      default:
        systemPrompt += "Tu dois rédiger une réponse professionnelle et appropriée.";
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('MISTRAL_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-tiny',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Voici l'email reçu:\n\n${receivedEmail}\n\nGénère une réponse professionnelle en français.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mistral API error:', errorData);
      throw new Error(`Mistral API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const generatedEmail = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ email: generatedEmail }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});