import { Button } from "@/components/ui/button";
import { LogOut, FilePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";
import { Session } from "@supabase/supabase-js";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        navigate("/login");
        return;
      }
      if (!currentSession) {
        navigate("/login");
        return;
      }
      setSession(currentSession);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'TOKEN_REFRESHED') {
        setSession(currentSession);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setSession(null);
        navigate("/login");
      } else if (event === 'USER_UPDATED') {
        setSession(currentSession);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la déconnexion",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      navigate("/login");
    }
  };

  // If no session, don't render the navigation
  if (!session) {
    return null;
  }

  return (
    <>
      <nav className="border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/lovable-uploads/e2ad46c3-367b-4223-acfa-1217eaef449a.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-white">Drone Valais Production</h1>
          </div>
          <div className="flex items-center space-x-4">
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
          </div>
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
    </>
  );
};