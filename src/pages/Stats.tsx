
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube } from "lucide-react";
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
        
        <div className="flex gap-4 justify-center mb-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="flex items-center gap-2 hover:bg-red-500/10"
              >
                <Youtube className="h-5 w-5 text-red-500" />
                Statistiques YouTube
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[90vw] sm:w-[600px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Statistiques YouTube</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <YoutubeStats />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="flex items-center gap-2 hover:bg-pink-500/10"
              >
                <Instagram className="h-5 w-5 text-pink-500" />
                Statistiques Instagram
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[90vw] sm:w-[600px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Statistiques Instagram</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <InstagramStats />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="text-center text-muted-foreground">
          Cliquez sur un des boutons ci-dessus pour voir les statistiques détaillées
        </div>
      </div>
    </div>
  );
};

export default Stats;
