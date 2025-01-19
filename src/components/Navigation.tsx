import { Button } from "@/components/ui/button";
import { LogOut, FilePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      // If there's no session, just redirect to login
      if (!session) {
        navigate("/login");
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la déconnexion",
          variant: "destructive",
        });
      }
      
      // Always navigate to login page
      navigate("/login");
      
      if (!error) {
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès",
        });
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      navigate("/login");
    }
  };

  return (
    <>
      <nav className="border-b border-white/10 bg-background/80 backdrop-blur-sm fixed w-full top-0 z-50 animate-fade-in">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <img src="/lovable-uploads/e2ad46c3-367b-4223-acfa-1217eaef449a.png" alt="Logo" className="h-12 w-auto hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Drone Valais Production
              </h1>
              <p className="text-sm text-muted-foreground">Gestion des factures</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setShowInvoiceForm(true)} 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-white/80 hover:scale-105 transition-all duration-200"
            >
              <FilePlus className="h-5 w-5" />
            </Button>
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-white/80 hover:scale-105 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <Sheet open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background/95 backdrop-blur-sm border-l border-white/10">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
              Nouveau devis
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};