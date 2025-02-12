
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { addHours, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

const bookingSchema = z.object({
  startDate: z.date({
    required_error: "Veuillez sélectionner une date de début",
  }),
  endDate: z.date({
    required_error: "Veuillez sélectionner une date de fin",
  }),
  userName: z.string().min(1, "Veuillez sélectionner votre nom"),
}).refine(data => data.endDate > data.startDate, {
  message: "La date de fin doit être après la date de début",
  path: ["endDate"],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface EquipmentBookingFormProps {
  equipmentId: string;
  equipmentName: string;
}

export const EquipmentBookingForm = ({ equipmentId, equipmentName }: EquipmentBookingFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: addHours(new Date(), 24),
      userName: "",
    },
  });

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      const { data, error } = await supabase
        .from("equipment_bookings")
        .insert({
          equipment_id: equipmentId,
          start_date: values.startDate.toISOString(),
          end_date: values.endDate.toISOString(),
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Réserver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1F2C] relative">
        <DialogHeader>
          <DialogTitle className="text-white">Réserver {equipmentName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Votre nom</FormLabel>
                  <select
                    {...field}
                    className="w-full px-3 py-2 rounded-md bg-[#221F26] text-white border-gray-600"
                  >
                    <option value="" className="bg-[#221F26]">Sélectionnez votre nom</option>
                    <option value="Bastien Ryser" className="bg-[#221F26]">Bastien Ryser</option>
                    <option value="Noah Carron" className="bg-[#221F26]">Noah Carron</option>
                    <option value="Pierre Monnet" className="bg-[#221F26]">Pierre Monnet</option>
                  </select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-white">Date de début</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-[#221F26] text-white border-gray-600",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "d MMMM yyyy", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1A1F2C] border-gray-600 z-[100]" align="start" side="bottom">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                        className="text-white [&_.rdp-day:not(.rdp-day_selected)]:text-white [&_.rdp-day]:cursor-pointer [&_.rdp-button:hover]:bg-blue-500 [&_.rdp-day_selected]:bg-blue-500 [&_.rdp-day_selected]:hover:bg-blue-600 [&_.rdp-button:focus]:bg-blue-500 [&_.rdp-nav_button]:text-white [&_.rdp-caption]:text-white [&_.rdp-head_cell]:text-white [&_.rdp-button[disabled]]:text-gray-500 [&_.rdp-button[disabled]]:hover:bg-transparent"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-white">Date de fin</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-[#221F26] text-white border-gray-600",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "d MMMM yyyy", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1A1F2C] border-gray-600 z-[100]" align="start" side="bottom">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < form.getValues("startDate")
                        }
                        initialFocus
                        className="text-white [&_.rdp-day:not(.rdp-day_selected)]:text-white [&_.rdp-day]:cursor-pointer [&_.rdp-button:hover]:bg-blue-500 [&_.rdp-day_selected]:bg-blue-500 [&_.rdp-day_selected]:hover:bg-blue-600 [&_.rdp-button:focus]:bg-blue-500 [&_.rdp-nav_button]:text-white [&_.rdp-caption]:text-white [&_.rdp-head_cell]:text-white [&_.rdp-button[disabled]]:text-gray-500 [&_.rdp-button[disabled]]:hover:bg-transparent"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
              {isPending ? "Réservation en cours..." : "Réserver"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
