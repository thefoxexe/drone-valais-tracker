
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface LogoProps {
  showText?: boolean;
}

export const Logo = ({ showText = true }: LogoProps) => {
  const isMobile = useIsMobile();
  
  return (
    <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
      <img 
        src="/lovable-uploads/e2ad46c3-367b-4223-acfa-1217eaef449a.png" 
        alt="Logo" 
        className="h-10 w-auto" 
      />
      {showText && !isMobile && (
        <h1 className="text-2xl font-bold text-white">
          Drone Valais Production
        </h1>
      )}
    </Link>
  );
};
