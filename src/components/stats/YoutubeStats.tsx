
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
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
      console.log("YouTube API Response:", data);
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <div className="text-center py-4">
            Chargement des statistiques YouTube...
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
            Erreur lors du chargement des statistiques YouTube
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-white/10">
      <CardContent className="p-6">
        {/* En-tête avec photo et info de la chaîne */}
        <div className="flex items-center space-x-6 mb-10 bg-card/30 p-6 rounded-xl backdrop-blur-md">
          <img 
            src={stats?.channelThumbnail} 
            alt={stats?.channelName} 
            className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-xl"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold mb-2">{stats?.channelName}</h2>
              <img 
                src="/lovable-uploads/215173d0-46bd-406d-bc52-788928e0d6fc.png"
                alt="YouTube Logo"
                className="h-20 w-auto"
              />
            </div>
            <p className="text-muted-foreground line-clamp-2">{stats?.channelDescription}</p>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-card/30 backdrop-blur-md rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {stats?.subscriberCount ? 
                      parseInt(stats.subscriberCount).toLocaleString('fr-FR') : 
                      '0'}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Abonnés</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">YouTube</span>
            </div>
          </div>

          <div className="bg-card/30 backdrop-blur-md rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {stats?.viewCount ? 
                      parseInt(stats.viewCount).toLocaleString('fr-FR') : 
                      '0'}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Vues totales</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">YouTube</span>
            </div>
          </div>

          <div className="bg-card/30 backdrop-blur-md rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {stats?.videoCount ? 
                      parseInt(stats.videoCount).toLocaleString('fr-FR') : 
                      '0'}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Vidéos publiées</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">YouTube</span>
            </div>
          </div>
        </div>

        {/* Graphique d'évolution */}
        <div className="bg-card/30 backdrop-blur-md rounded-xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Évolution des abonnés</h3>
            <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">YouTube</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.historicalData || []}>
                <defs>
                  <linearGradient id="statsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
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
                        <div className="rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur-sm">
                          <div className="grid gap-2">
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
                              <span className="font-bold text-primary">
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
                  strokeWidth={2}
                  fill="url(#statsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
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
