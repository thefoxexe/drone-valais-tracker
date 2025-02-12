
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Booking = {
  id: string;
  start_date: string;
  end_date: string;
  user_name: string;
  equipment: {
    name: string;
    type: string;
    status: string;
  };
};

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
      return data as Booking[];
    },
  });

  const bookingsForSelectedDate = bookings?.filter((booking) => {
    if (!date) return false;
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    const selectedDate = new Date(date);
    
    // Réinitialiser les heures pour comparer uniquement les dates
    selectedDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  if (isLoading) {
    return <div>Chargement du calendrier...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
          />
        </div>
        <div className="space-y-4">
          <h3 className="font-medium">
            Réservations du {date && format(date, "d MMMM yyyy", { locale: fr })}
          </h3>
          {bookingsForSelectedDate?.length ? (
            <div className="space-y-3">
              {bookingsForSelectedDate.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-medium">
                      {booking.equipment.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid gap-1">
                      <div className="text-sm">
                        Réservé par <Badge variant="secondary">{booking.user_name}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Du {format(new Date(booking.start_date), "d MMMM", { locale: fr })} au{" "}
                        {format(new Date(booking.end_date), "d MMMM", { locale: fr })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Aucune réservation pour cette date
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
