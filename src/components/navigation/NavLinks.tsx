import { Button } from "@/components/ui/button";
import { LogOut, FilePlus, HardDrive } from "lucide-react";
import { Link } from "react-router-dom";

interface NavLinksProps {
  onResourceClick: () => void;
  onInvoiceClick: () => void;
  onLogout: () => void;
}

export const NavLinks = ({ onResourceClick, onInvoiceClick, onLogout }: NavLinksProps) => (
  <>
    <Link to="/">
      <Button 
        variant="ghost" 
        className="text-white hover:text-white/80"
      >
        Dashboard
      </Button>
    </Link>
    <Link to="/projects">
      <Button 
        variant="ghost" 
        className="text-white hover:text-white/80"
      >
        Projets
      </Button>
    </Link>
    <Button 
      onClick={onResourceClick} 
      variant="ghost" 
      size="icon" 
      className="text-white hover:text-white/80"
    >
      <HardDrive className="h-5 w-5" />
    </Button>
    <Button 
      onClick={onInvoiceClick} 
      variant="ghost" 
      size="icon" 
      className="text-white hover:text-white/80"
    >
      <FilePlus className="h-5 w-5" />
    </Button>
    <Button 
      onClick={onLogout} 
      variant="ghost" 
      size="icon" 
      className="text-white hover:text-white/80"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  </>
);