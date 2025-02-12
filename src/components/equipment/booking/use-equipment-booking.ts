
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { addDays, addMonths } from "date-fns";
import { BookingFormValues, bookingSchema } from "./types";

export const useEquipmentBooking = (equipmentId: string, onSuccess: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startDate: new Date(),
      duration: 1,
      userName: "",
    },
  });

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      const endDate = values.duration === 30 
        ? addMonths(values.startDate, 1)
        : addDays(values.startDate, values.duration);

      const { data, error } = await supabase
        .from("equipment_bookings")
        .insert({
          equipment_id: equipmentId,
          start_date: values.startDate.toISOString(),
          end_date: endDate.toISOString(),
          user_id: "00000000-0000-0000-0000-000000000000",
          user_name: values.userName,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment-bookings"] });
      toast({
        title: "Réservation effectuée",
        description: "Le matériel a été réservé avec succès",
      });
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Erreur lors de la réservation:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation",
      });
    },
  });

  const onSubmit = (values: BookingFormValues) => {
    createBooking(values);
  };

  return {
    form,
    isPending,
    onSubmit,
  };
};
