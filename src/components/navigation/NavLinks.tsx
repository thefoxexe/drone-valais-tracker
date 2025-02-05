import { Button } from "@/components/ui/button";
import { LogOut, FilePlus, HardDrive, LayoutDashboard, Briefcase } from "lucide-react";
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
        className="text-white hover:text-white/80 w-full justify-start"
      >
        <LayoutDashboard className="h-5 w-5 mr-2" />
        Dashboard
      </Button>
    </Link>
    <Link to="/projects">
      <Button 
        variant="ghost" 
        className="text-white hover:text-white/80 w-full justify-start"
      >
        <Briefcase className="h-5 w-5 mr-2" />
        Projets
      </Button>
    </Link>
    <Button 
      onClick={onResourceClick} 
      variant="ghost" 
      className="text-white hover:text-white/80 w-full justify-start"
    >
      <HardDrive className="h-5 w-5 mr-2" />
      Drive
    </Button>
    <Button 
      onClick={onInvoiceClick} 
      variant="ghost" 
      className="text-white hover:text-white/80 w-full justify-start"
    >
      <FilePlus className="h-5 w-5 mr-2" />
      Nouveau devis
    </Button>
    <Button 
      onClick={onLogout} 
      variant="ghost" 
      className="text-white hover:text-white/80 w-full justify-start"
    >
      <LogOut className="h-5 w-5 mr-2" />
      Déconnexion
    </Button>
  </>
);