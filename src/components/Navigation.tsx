import { Button } from "@/components/ui/button";
import { LogOut, FilePlus, HardDrive, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";
import { ResourceDialog } from "./ResourceDialog";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erreur de déconnexion:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la déconnexion",
        });
        return;
      }

      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Erreur inattendue lors de la déconnexion:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
      });
    }
  };

  const NavLinks = () => (
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
        onClick={() => setShowResourceDialog(true)} 
        variant="ghost" 
        size="icon" 
        className="text-white hover:text-white/80"
      >
        <HardDrive className="h-5 w-5" />
      </Button>
      <Button 
        onClick={() => setShowInvoiceForm(true)} 
        variant="ghost" 
        size="icon" 
        className="text-white hover:text-white/80"
      >
        <FilePlus className="h-5 w-5" />
      </Button>
      <Button 
        onClick={handleLogout} 
        variant="ghost" 
        size="icon" 
        className="text-white hover:text-white/80"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </>
  );

  return (
    <>
      <nav className="border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <img src="/lovable-uploads/e2ad46c3-367b-4223-acfa-1217eaef449a.png" alt="Logo" className="h-10 w-auto" />
              {!isMobile && (
                <h1 className="text-2xl font-bold text-white">Drone Valais Production</h1>
              )}
            </Link>
          </div>
          
          {isMobile ? (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] bg-background p-0">
                <div className="flex flex-col space-y-4 p-4">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-4">
              <NavLinks />
            </div>
          )}
        </div>
      </nav>

      <Sheet open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nouveau devis</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <ResourceDialog 
        open={showResourceDialog} 
        onOpenChange={setShowResourceDialog} 
      />
    </>
  );
};