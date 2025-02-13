
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { YoutubeStats } from "@/components/stats/YoutubeStats";
import { InstagramStats } from "@/components/stats/InstagramStats";

const Stats = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'youtube' | 'instagram' | null>(null);

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
        
        <div className="flex gap-4 justify-center mb-8">
          <Button 
            variant={activeTab === 'youtube' ? 'default' : 'outline'}
            size="lg"
            className="flex items-center gap-2 hover:bg-red-500/10"
            onClick={() => setActiveTab(activeTab === 'youtube' ? null : 'youtube')}
          >
            <Youtube className="h-5 w-5 text-red-500" />
            Statistiques YouTube
          </Button>

          <Button 
            variant={activeTab === 'instagram' ? 'default' : 'outline'}
            size="lg"
            className="flex items-center gap-2 hover:bg-pink-500/10"
            onClick={() => setActiveTab(activeTab === 'instagram' ? null : 'instagram')}
          >
            <Instagram className="h-5 w-5 text-pink-500" />
            Statistiques Instagram
          </Button>
        </div>

        {!activeTab && (
          <div className="text-center text-muted-foreground">
            Cliquez sur un des boutons ci-dessus pour voir les statistiques détaillées
          </div>
        )}

        {activeTab === 'youtube' && (
          <div className="bg-card/30 backdrop-blur-md rounded-xl p-8 border border-white/5 animate-fade-in">
            <div className="max-w-[1400px] mx-auto">
              <h2 className="text-3xl font-bold mb-6">Statistiques YouTube</h2>
              <YoutubeStats />
            </div>
          </div>
        )}

        {activeTab === 'instagram' && (
          <div className="bg-card/30 backdrop-blur-md rounded-xl p-8 border border-white/5 animate-fade-in">
            <div className="max-w-[1400px] mx-auto">
              <h2 className="text-3xl font-bold mb-6">Statistiques Instagram</h2>
              <InstagramStats />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
