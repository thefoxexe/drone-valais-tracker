
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { YoutubeHeader } from "@/components/navigation/YoutubeHeader";
import { Card } from "@/components/ui/card";
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
          
          <div className="mt-16">
            <Card className="bg-background/80 backdrop-blur-sm border-white/10">
              <div className="p-6 space-y-8">
                <InstagramStats />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
