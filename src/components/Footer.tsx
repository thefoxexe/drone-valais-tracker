
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export const Footer = () => {
  const [isBeating, setIsBeating] = useState(false);

  // Animation du battement de cœur
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBeating(true);
      setTimeout(() => {
        setIsBeating(false);
      }, 300);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="mt-auto py-4 text-center text-sm text-muted-foreground">
      <div className="flex items-center justify-center gap-1">
        Conçu avec 
        <span className={`inline-block transition-transform ${isBeating ? 'scale-125' : 'scale-100'}`}>
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
        </span>
        par <a href="https://webalp.ch" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
          WebAlp.ch
        </a>
      </div>
    </footer>
  );
};
