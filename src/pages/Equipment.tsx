
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipmentCalendar } from "@/components/equipment/EquipmentCalendar";
import { EquipmentList } from "@/components/equipment/EquipmentList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Footer } from "@/components/Footer";

const Equipment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous devez être connecté pour accéder à cette page",
        });
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <DashboardHeader 
          title="Matériel" 
          description="Gérez et réservez le matériel de production" 
        />
        <Tabs defaultValue="calendar" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="list">Liste du matériel</TabsTrigger>
          </TabsList>
          <TabsContent value="calendar" className="mt-6">
            <EquipmentCalendar />
          </TabsContent>
          <TabsContent value="list" className="mt-6">
            <EquipmentList />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Equipment;
