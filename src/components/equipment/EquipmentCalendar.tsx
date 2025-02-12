
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const EquipmentCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["equipment-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment_bookings")
        .select(`
          *,
          equipment (
            name,
            type,
            status
          )
        `);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Chargement du calendrier...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md"
        />
      </div>
      <div className="space-y-4">
        {/* Nous ajouterons ici la liste des réservations pour la date sélectionnée */}
      </div>
    </div>
  );
};
