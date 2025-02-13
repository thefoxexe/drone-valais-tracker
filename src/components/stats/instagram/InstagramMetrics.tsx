
import { Users, Heart, Image } from "lucide-react";

interface InstagramMetricsProps {
  followerCount: number;
  totalLikes: number;
  mediaCount: number;
}

export const InstagramMetrics = ({ followerCount, totalLikes, mediaCount }: InstagramMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-card/30 backdrop-blur-md rounded-xl p-6 border border-white/5 hover:border-primary/20 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold">
                {followerCount.toLocaleString('fr-FR')}
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
                {totalLikes.toLocaleString('fr-FR')}
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
                {mediaCount.toLocaleString('fr-FR')}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Publications</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full">Instagram</span>
        </div>
      </div>
    </div>
  );
};
