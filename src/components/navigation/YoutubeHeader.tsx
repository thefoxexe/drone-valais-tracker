
import { Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export const YoutubeHeader = () => {
  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border-b border-white/10 fixed top-0 left-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <Youtube className="h-8 w-8 text-red-500" />
            <span className="text-xl font-semibold">YouTube</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
