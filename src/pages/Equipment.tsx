
import { Navigation } from "@/components/Navigation";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipmentCalendar } from "@/components/equipment/EquipmentCalendar";
import { EquipmentList } from "@/components/equipment/EquipmentList";

const Equipment = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
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
    </div>
  );
};

export default Equipment;
