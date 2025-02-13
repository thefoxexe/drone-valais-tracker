
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { InstagramHeader } from "./instagram/InstagramHeader";
import { InstagramMetrics } from "./instagram/InstagramMetrics";
import { InstagramChart } from "./instagram/InstagramChart";

interface InstagramStatsData {
  followerCount: number;
  followingCount: number;
  mediaCount: number;
  totalLikes: number;
  historicalData: Array<{
    date: string;
    follower_count: number;
    following_count: number;
    media_count: number;
    total_likes: number;
  }>;
  timestamp: string;
}

export const InstagramStats = () => {
  const { data: statsData, isLoading, error, refetch } = useQuery<InstagramStatsData>({
    queryKey: ["instagram-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-instagram-stats');
      if (error) throw error;
      console.log("Instagram API Response:", data);
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <div className="text-center py-4">
            Chargement des statistiques Instagram...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <div className="text-center py-4 text-red-500">
            Erreur lors du chargement des statistiques Instagram
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filtrer les données à partir d'aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filteredData = statsData?.historicalData.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= today;
  }) || [];

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-white/10">
      <CardContent className="p-6">
        <InstagramHeader onStatsUpdate={refetch} />
        
        <InstagramMetrics 
          followerCount={statsData?.followerCount || 0}
          totalLikes={statsData?.totalLikes || 0}
          mediaCount={statsData?.mediaCount || 0}
        />

        <InstagramChart data={filteredData} />

        <div className="mt-6 text-sm text-muted-foreground text-right">
          Dernière mise à jour : {statsData?.timestamp ? 
            new Date(statsData.timestamp).toLocaleString('fr-FR') : 
            'Inconnue'}
        </div>
      </CardContent>
    </Card>
  );
};
