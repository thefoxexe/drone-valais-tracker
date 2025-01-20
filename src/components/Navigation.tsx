import { Button } from "@/components/ui/button";
import { LogOut, FilePlus, Files } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InvoiceForm } from "./InvoiceForm";
import { ResourceDialog } from "./ResourceDialog";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showResourceDialog, setShowResourceDialog] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
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
      <nav className="border-b border-white/10 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/lovable-uploads/e2ad46c3-367b-4223-acfa-1217eaef449a.png" alt="Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-white">Drone Valais Production</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setShowResourceDialog(true)} 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-white/80"
            >
              <Files className="h-5 w-5" />
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

      <ResourceDialog 
        open={showResourceDialog} 
        onOpenChange={setShowResourceDialog} 
      />
    </>
  );
};