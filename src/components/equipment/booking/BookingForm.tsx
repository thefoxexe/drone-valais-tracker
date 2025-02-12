
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { BookingFormValues, durations } from "./types";
import { UseFormReturn } from "react-hook-form";
import { useState } from "react";

interface BookingFormProps {
  form: UseFormReturn<BookingFormValues>;
  onSubmit: (values: BookingFormValues) => void;
  isPending: boolean;
}

export const BookingForm = ({ form, onSubmit, isPending }: BookingFormProps) => {
  const [open, setOpen] = useState(false);

  return (
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
              <Popover open={open} onOpenChange={setOpen}>
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
                    onSelect={(date) => {
                      field.onChange(date);
                      setOpen(false);
                    }}
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
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Durée de la réservation</FormLabel>
              <select
                {...field}
                value={field.value}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-md bg-[#221F26] text-white border-gray-600"
              >
                {durations.map((duration) => (
                  <option key={duration.value} value={duration.value} className="bg-[#221F26]">
                    {duration.label}
                  </option>
                ))}
              </select>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isPending}>
          {isPending ? "Réservation en cours..." : "Réserver"}
        </Button>
      </form>
    </Form>
  );
};
