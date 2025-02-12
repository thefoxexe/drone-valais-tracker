
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Heart, Image } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
  const { data: stats, isLoading, error } = useQuery<InstagramStatsData>({
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

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-white/10">
      <CardContent className="p-6">
        {/* En-tête avec info du compte */}
        <div className="flex items-center space-x-6 mb-10 bg-card/30 p-6 rounded-xl backdrop-blur-md">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold mb-2">Instagram</h2>
              <img 
                src="/lovable-uploads/e2ad46c3-367b-4223-acfa-1217eaef449a.png"
                alt="Instagram Logo"
                className="h-20 w-auto"
              />
            </div>
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
                    {stats?.followerCount.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Abonnés</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">Instagram</span>
            </div>
          </div>

          <div className="bg-card/30 backdrop-blur-md rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {stats?.totalLikes.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Likes totaux</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">Instagram</span>
            </div>
          </div>

          <div className="bg-card/30 backdrop-blur-md rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold">
                    {stats?.mediaCount.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">Publications</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">Instagram</span>
            </div>
          </div>
        </div>

        {/* Graphique d'évolution */}
        <div className="bg-card/30 backdrop-blur-md rounded-xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Évolution des abonnés</h3>
            <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">Instagram</span>
          </div>
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
                  dataKey="follower_count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#instagramStatsGradient)"
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
