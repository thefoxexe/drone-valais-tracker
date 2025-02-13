import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Heart, Image, Plus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    follower_count: "",
    following_count: "",
    media_count: "",
    total_likes: "",
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStats(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('instagram_stats_history')
        .insert([{
          follower_count: parseInt(stats.follower_count),
          following_count: parseInt(stats.following_count),
          media_count: parseInt(stats.media_count),
          total_likes: parseInt(stats.total_likes),
        }]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Les statistiques ont été enregistrées",
      });

      // Réinitialiser le formulaire
      setStats({
        follower_count: "",
        following_count: "",
        media_count: "",
        total_likes: "",
      });

      // Rafraîchir les données
      refetch();
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les statistiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        {/* En-tête avec info du compte */}
        <div className="flex items-center justify-between mb-10 bg-card/30 p-6 rounded-xl backdrop-blur-md">
          <div className="flex items-center space-x-6">
            <img 
              src="/lovable-uploads/7090a80c-d493-413b-a458-7b7e5296e1ac.png"
              alt="Instagram Logo"
              className="w-24 h-24 object-contain"
            />
            <div>
              <h2 className="text-3xl font-bold mb-2">Drone Valais Production</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Ajouter des statistiques Instagram</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="follower_count" className="block text-sm font-medium mb-2">
                        Nombre d'abonnés
                      </label>
                      <Input
                        id="follower_count"
                        name="follower_count"
                        type="number"
                        value={stats.follower_count}
                        onChange={handleChange}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="following_count" className="block text-sm font-medium mb-2">
                        Nombre d'abonnements
                      </label>
                      <Input
                        id="following_count"
                        name="following_count"
                        type="number"
                        value={stats.following_count}
                        onChange={handleChange}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="media_count" className="block text-sm font-medium mb-2">
                        Nombre de publications
                      </label>
                      <Input
                        id="media_count"
                        name="media_count"
                        type="number"
                        value={stats.media_count}
                        onChange={handleChange}
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="total_likes" className="block text-sm font-medium mb-2">
                        Nombre total de likes
                      </label>
                      <Input
                        id="total_likes"
                        name="total_likes"
                        type="number"
                        value={stats.total_likes}
                        onChange={handleChange}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Enregistrement..." : "Enregistrer les statistiques"}
                  </Button>
                </form>
              </SheetContent>
            </Sheet>
            <img 
              src="/lovable-uploads/e2ad46c3-367b-4223-acfa-1217eaef449a.png"
              alt="Instagram Logo"
              className="h-20 w-auto"
            />
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
                    {statsData?.followerCount.toLocaleString('fr-FR')}
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
                    {statsData?.totalLikes.toLocaleString('fr-FR')}
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
                    {statsData?.mediaCount.toLocaleString('fr-FR')}
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
            <h3 className="text-xl font-semibold">Évolution des abonnés aujourd'hui</h3>
            <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">Instagram</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
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
                  tickFormatter={(date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
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
                                Heure
                              </span>
                              <span className="font-bold">
                                {new Date(label).toLocaleTimeString('fr-FR')}
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
          Dernière mise à jour : {statsData?.timestamp ? 
            new Date(statsData.timestamp).toLocaleString('fr-FR') : 
            'Inconnue'}
        </div>
      </CardContent>
    </Card>
  );
};
