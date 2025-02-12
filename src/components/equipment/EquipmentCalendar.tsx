
import { Calendar } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

type Booking = {
  id: string;
  start_date: string;
  end_date: string;
  user_name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  equipment_id: string;
  equipment: {
    name: string;
    type: "drone" | "camera" | "stabilizer" | "other";
    status: "available" | "maintenance" | "out_of_order";
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
        `) as { data: Booking[] | null; error: any };

      if (error) throw error;
      return data || [];
    },
  });

  const bookingsForSelectedDate = bookings?.filter((booking) => {
    if (!date) return false;
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    const selectedDate = new Date(date);
    
    selectedDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            Chargement du calendrier...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:sticky md:top-4 h-fit">
        <CardHeader>
          <CardTitle>Calendrier des réservations</CardTitle>
          <CardDescription>
            Sélectionnez une date pour voir les réservations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            locale={fr}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Réservations du {date && format(date, "d MMMM yyyy", { locale: fr })}
          </CardTitle>
          <CardDescription>
            {bookingsForSelectedDate?.length
              ? `${bookingsForSelectedDate.length} réservation${
                  bookingsForSelectedDate.length > 1 ? "s" : ""
                }`
              : "Aucune réservation"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookingsForSelectedDate?.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3">
                  <CardTitle className="text-base font-medium">
                    {booking.equipment.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{booking.user_name}</Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(booking.start_date), "HH:mm")} -{" "}
                        {format(new Date(booking.end_date), "HH:mm")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!bookingsForSelectedDate?.length && (
              <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <p>Aucune réservation pour cette date</p>
                <p className="text-sm">Sélectionnez une autre date ou ajoutez une nouvelle réservation</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
