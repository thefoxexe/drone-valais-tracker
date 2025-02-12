import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Play, Video, Clock } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bar, BarChart } from "recharts";

interface YoutubeStatsData {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  watchTimeHours: string;
  timestamp: string;
}

const mockViewsData = [
  { date: '2024-01-01', views: 1200 },
  { date: '2024-01-02', views: 1500 },
  { date: '2024-01-03', views: 1300 },
  { date: '2024-01-04', views: 1800 },
  { date: '2024-01-05', views: 2000 },
  { date: '2024-01-06', views: 1700 },
  { date: '2024-01-07', views: 2200 },
];

export const YoutubeStats = () => {
  const { data: currentStats, isLoading, error } = useQuery<YoutubeStatsData>({
    queryKey: ["youtube-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-youtube-stats');
      if (error) throw error;
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  const history = [
    { date: '2024-01-01', view_count: 1200 },
    { date: '2024-01-02', view_count: 1500 },
    { date: '2024-01-03', view_count: 1300 },
    { date: '2024-01-04', view_count: 1800 },
    { date: '2024-01-05', view_count: 2000 },
    { date: '2024-01-06', view_count: 1700 },
    { date: '2024-01-07', view_count: 2200 },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Abonnés</span>
                    <span className="text-2xl font-bold">
                      {currentStats?.subscriberCount ? 
                        parseInt(currentStats.subscriberCount).toLocaleString('fr-FR') : 
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
                      {currentStats?.viewCount ? 
                        parseInt(currentStats.viewCount).toLocaleString('fr-FR') : 
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
                      {currentStats?.videoCount ? 
                        parseInt(currentStats.videoCount).toLocaleString('fr-FR') : 
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
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Heures de visionnage</span>
                    <span className="text-2xl font-bold">
                      {currentStats?.watchTimeHours ? 
                        parseInt(currentStats.watchTimeHours).toLocaleString('fr-FR') : 
                        '0'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Évolution des vues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history}>
                  <XAxis
                    dataKey="date"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
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
                                  Vues
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
                  <Bar
                    dataKey="view_count"
                    fill="hsl(var(--primary))"
                    name="Vues"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-muted-foreground text-right">
          Dernière mise à jour : {currentStats?.timestamp ? 
            new Date(currentStats.timestamp).toLocaleString('fr-FR') : 
            'Inconnue'}
        </div>
      </CardContent>
    </Card>
  );
};
