
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Play, Video } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface YoutubeStatsData {
  channelName: string;
  channelDescription: string;
  channelThumbnail: string;
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  historicalData: Array<{
    date: string;
    subscriber_count: number;
    view_count: number;
    video_count: number;
  }>;
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
        <CardContent className="p-6">
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
        <CardContent className="p-6">
          <div className="text-center py-4 text-red-500">
            Erreur lors du chargement des statistiques
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-white/10">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-8">
          <img 
            src={stats?.channelThumbnail} 
            alt="Channel thumbnail" 
            className="w-16 h-16 rounded-full border-2 border-white/10"
          />
          <div>
            <h2 className="text-2xl font-bold">{stats?.channelName}</h2>
            <p className="text-sm text-muted-foreground line-clamp-2">{stats?.channelDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Abonnés</span>
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

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Play className="h-5 w-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Vues totales</span>
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

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Video className="h-5 w-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-muted-foreground">Vidéos publiées</span>
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

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">Évolution des abonnés</h3>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.historicalData || []}>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value.toLocaleString('fr-FR')}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Date
                                </span>
                                <span className="font-bold">
                                  {new Date(label).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Abonnés
                                </span>
                                <span className="font-bold">
                                  {payload[0].value.toLocaleString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="subscriber_count"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-muted-foreground text-right">
          Dernière mise à jour : {stats?.timestamp ? 
            new Date(stats.timestamp).toLocaleString('fr-FR') : 
            'Inconnue'}
        </div>
      </CardContent>
    </Card>
  );
};
