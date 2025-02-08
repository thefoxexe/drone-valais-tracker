
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getFullName = (email: string): string => {
  switch (email) {
    case "bastienryser20004@gmail.com":
      return "Bastien Ryser";
    case "noah.carron06@gmail.com":
      return "Noah Carron";
    case "monnetpierre78@gmail.com":
      return "Pierre Monnet";
    default:
      return "Unknown User";
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receivedEmail, intention, userEmail } = await req.json();
    const fullName = getFullName(userEmail);

    const systemPrompt = "Tu es un assistant professionnel qui aide à rédiger des réponses d'emails en français. " +
      "Tu dois rédiger une réponse professionnelle qui correspond exactement aux instructions données tout en maintenant un ton courtois et professionnel. " +
      "À la fin de l'email, ajoute toujours une signature avec le nom fourni, suivi de 'Drone Valais Production' et 'www.dronevalais-production.ch' sur des lignes séparées.";

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
            content: `Voici l'email reçu:\n\n${receivedEmail}\n\nInstructions pour la réponse:\n${intention}\n\nUtilise cette signature:\n${fullName}\nDrone Valais Production\nwww.dronevalais-production.ch`
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
