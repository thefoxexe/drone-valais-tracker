
import { z } from "zod";

export const durations = [
  { label: "1 jour", value: 1 },
  { label: "2 jours", value: 2 },
  { label: "7 jours", value: 7 },
  { label: "1 mois", value: 30 },
] as const;

export const bookingSchema = z.object({
  startDate: z.date({
    required_error: "Veuillez sélectionner une date de début",
  }),
  duration: z.number({
    required_error: "Veuillez sélectionner une durée",
  }),
  userName: z.string().min(1, "Veuillez sélectionner votre nom"),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

export interface EquipmentBookingFormProps {
  equipmentId: string;
  equipmentName: string;
}
