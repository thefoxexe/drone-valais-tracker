
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "./navigation/Logo";
import { NavLinks } from "./navigation/NavLinks";
import { MobileMenu } from "./navigation/MobileMenu";
import { ModalForms } from "./navigation/ModalForms";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
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

  return (
    <>
      <nav className="border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo showText={!isMobile} />
          
          {isMobile ? (
            <MobileMenu
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              onResourceClick={() => setShowResourceDialog(true)}
              onInvoiceClick={() => setShowInvoiceForm(true)}
              onVideoClick={() => setShowVideoForm(true)}
              onLogout={handleLogout}
            />
          ) : (
            <div className="flex items-center space-x-4">
              <NavLinks 
                onResourceClick={() => setShowResourceDialog(true)}
                onInvoiceClick={() => setShowInvoiceForm(true)}
                onVideoClick={() => setShowVideoForm(true)}
                onLogout={handleLogout}
              />
            </div>
          )}
        </div>
      </nav>

      <ModalForms
        showInvoiceForm={showInvoiceForm}
        setShowInvoiceForm={setShowInvoiceForm}
        showResourceDialog={showResourceDialog}
        setShowResourceDialog={setShowResourceDialog}
        showVideoForm={showVideoForm}
        setShowVideoForm={setShowVideoForm}
      />
    </>
  );
};
