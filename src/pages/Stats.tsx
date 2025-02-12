
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { YoutubeStats } from "@/components/stats/YoutubeStats";
import { InstagramStats } from "@/components/stats/InstagramStats";

const Stats = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });
  }, [navigate]);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ 
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/lovable-uploads/deccad97-d3eb-4324-b51b-6bde7ebac742.png')"
      }}
    >
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Statistiques Réseaux Sociaux</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <YoutubeStats />
          <InstagramStats />
        </div>
      </div>
    </div>
  );
};

export default Stats;
