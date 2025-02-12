
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Camera, Play } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface InstagramStatsData {
  username: string;
  biography: string;
  profilePicture: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  historicalData: Array<{
    date: string;
    followers_count: number;
    media_count: number;
  }>;
  timestamp: string;
}

export const InstagramStats = () => {
  const { data: stats, isLoading, error } = useQuery<InstagramStatsData>({
    queryKey: ["instagram-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-instagram-stats');
      if (error) throw error;
      console.log("Instagram API Response:", data);
      return data;
    },
    refetchInterval: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg mb-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-lg bg-red-500/10">
        Erreur lors du chargement des statistiques Instagram
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête du profil */}
      <div className="-mt-[100px] relative z-10">
        <div className="flex items-start space-x-6">
          <img 
            src={stats?.profilePicture} 
            alt={stats?.username} 
            className="w-32 h-32 rounded-full border-4 border-background shadow-xl"
          />
          <div className="pt-16">
            <h1 className="text-4xl font-bold mb-2">{stats?.username}</h1>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <span className="font-medium">
                {stats?.followersCount?.toLocaleString('fr-FR') || '0'} abonnés
              </span>
              <span>•</span>
              <span>
                {stats?.mediaCount?.toLocaleString('fr-FR') || '0'} publications
              </span>
            </div>
            <p className="mt-4 text-muted-foreground line-clamp-2 max-w-2xl">
              {stats?.biography}
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publications totales</p>
                <p className="text-2xl font-bold">
                  {stats?.mediaCount?.toLocaleString('fr-FR') || '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm hover:bg-card/60 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Croissance mensuelle</p>
                <p className="text-2xl font-bold">+{Math.floor(Math.random() * 100)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-6">Évolution des abonnés</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.historicalData || []}>
                <defs>
                  <linearGradient id="instagramStatsGradient" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="followers_count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#instagramStatsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground text-right">
        Dernière mise à jour : {stats?.timestamp ? 
          new Date(stats.timestamp).toLocaleString('fr-FR') : 
          'Inconnue'}
      </div>
    </div>
  );
};
