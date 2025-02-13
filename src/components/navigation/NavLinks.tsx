
import { Button } from "@/components/ui/button";
import { LogOut, FilePlus, HardDrive, LayoutDashboard, Briefcase, Mail, BarChart, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavLinksProps {
  onResourceClick: () => void;
  onInvoiceClick: () => void;
  onLogout: () => void;
  inHamburgerMenu?: boolean;
}

export const NavLinks = ({ onResourceClick, onInvoiceClick, onLogout, inHamburgerMenu = false }: NavLinksProps) => {
  const isMobile = useIsMobile();

  // Les liens qui apparaîtront dans le menu hamburger
  const hamburgerLinks = (
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
      <Link to="/equipment">
        <Button 
          variant="ghost" 
          className="text-white hover:text-white/80 w-full justify-start"
        >
          <Wrench className="h-5 w-5 mr-2" />
          Matériel
        </Button>
      </Link>
      <Link to="/emails">
        <Button 
          variant="ghost" 
          className="text-white hover:text-white/80 w-full justify-start"
        >
          <Mail className="h-5 w-5 mr-2" />
          Emails
        </Button>
      </Link>
      <Link to="/stats">
        <Button 
          variant="ghost" 
          className="text-white hover:text-white/80 w-full justify-start"
        >
          <BarChart className="h-5 w-5 mr-2" />
          Statistiques
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
    </>
  );

  // Les boutons qui restent toujours visibles
  const visibleButtons = (
    <>
      <Button 
        onClick={onInvoiceClick} 
        variant="ghost" 
        className="text-white hover:text-white/80"
        size={isMobile ? "icon" : "default"}
      >
        <FilePlus className="h-5 w-5" />
        {!isMobile && <span className="ml-2">Nouveau devis</span>}
      </Button>
      <Button 
        onClick={onLogout} 
        variant="ghost" 
        className="text-white hover:text-white/80"
        size={isMobile ? "icon" : "default"}
      >
        <LogOut className="h-5 w-5" />
        {!isMobile && <span className="ml-2">Déconnexion</span>}
      </Button>
    </>
  );

  return inHamburgerMenu ? hamburgerLinks : visibleButtons;
};
