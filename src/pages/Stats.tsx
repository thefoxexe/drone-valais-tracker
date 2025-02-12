
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { YoutubeHeader } from "@/components/navigation/YoutubeHeader";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { YoutubeStats } from "@/components/stats/YoutubeStats";

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
    <div className="min-h-screen bg-background">
      <YoutubeHeader />
      
      {/* Bannière de la chaîne */}
      <div 
        className="w-full h-[200px] bg-cover bg-center mt-16"
        style={{ 
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/lovable-uploads/deccad97-d3eb-4324-b51b-6bde7ebac742.png')",
          backgroundPosition: "center 25%"
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <YoutubeStats />
          
          <Card className="bg-background/80 backdrop-blur-sm border-white/10">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">Instagram</h3>
              <p className="text-muted-foreground">
                L'intégration Instagram sera disponible prochainement...
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Stats;
