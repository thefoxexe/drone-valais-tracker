
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const StatsInput = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [stats, setStats] = useState({
    follower_count: "",
    following_count: "",
    media_count: "",
    total_likes: "",
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

  return (
    <Card className="bg-background/80 backdrop-blur-sm border-white/10 mb-6">
      <CardHeader>
        <CardTitle>Ajouter des statistiques Instagram</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="bg-background/50"
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
                className="bg-background/50"
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
                className="bg-background/50"
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
                className="bg-background/50"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enregistrement..." : "Enregistrer les statistiques"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
