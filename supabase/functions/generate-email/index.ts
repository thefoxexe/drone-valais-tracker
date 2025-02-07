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
    const { receivedEmail, keyPoints, signature } = await req.json();

    const systemPrompt = `Tu es un assistant professionnel qui aide à rédiger des réponses d'emails en français. 
    Utilise les points clés fournis pour générer une réponse professionnelle et courtoise.
    La réponse doit être claire, concise et bien structurée.
    Termine toujours l'email avec la signature fournie au format suivant:

    [Nom]
    [Entreprise]
    [Site web]`;

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
            content: `Email reçu:\n\n${receivedEmail}\n\nPoints clés pour la réponse:\n${keyPoints}\n\nGénère une réponse professionnelle en français et termine avec cette signature:\n\n${signature.name}\n${signature.company}\n${signature.website}`
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