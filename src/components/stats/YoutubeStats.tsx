
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Play, Video } from "lucide-react";

interface YoutubeStatsData {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  timestamp: string;
}

export const YoutubeStats = () => {
  const { data: stats, isLoading, error } = useQuery<YoutubeStatsData>({
    queryKey: ["youtube-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-youtube-stats');
      if (error) throw error;
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle>YouTube</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            Chargement des statistiques...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle>YouTube</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Erreur lors du chargement des statistiques
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle>YouTube</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Abonnés</span>
                    <span className="text-2xl font-bold">
                      {stats?.subscriberCount ? 
                        parseInt(stats.subscriberCount).toLocaleString('fr-FR') : 
                        '0'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Play className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Vues totales</span>
                    <span className="text-2xl font-bold">
                      {stats?.viewCount ? 
                        parseInt(stats.viewCount).toLocaleString('fr-FR') : 
                        '0'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Vidéos publiées</span>
                    <span className="text-2xl font-bold">
                      {stats?.videoCount ? 
                        parseInt(stats.videoCount).toLocaleString('fr-FR') : 
                        '0'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-sm text-muted-foreground text-right">
          Dernière mise à jour : {stats?.timestamp ? 
            new Date(stats.timestamp).toLocaleString('fr-FR') : 
            'Inconnue'}
        </div>
      </CardContent>
    </Card>
  );
};
