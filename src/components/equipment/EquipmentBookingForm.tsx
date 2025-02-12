
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { BookingForm } from "./booking/BookingForm";
import { useEquipmentBooking } from "./booking/use-equipment-booking";
import { EquipmentBookingFormProps } from "./booking/types";

export const EquipmentBookingForm = ({ equipmentId, equipmentName }: EquipmentBookingFormProps) => {
  const [open, setOpen] = useState(false);
  const { form, isPending, onSubmit } = useEquipmentBooking(equipmentId, () => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Réserver
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-h-[90vh] overflow-y-auto sm:max-w-[425px] bg-[#1A1F2C]">
        <DialogHeader>
          <DialogTitle className="text-white">Réserver {equipmentName}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Ce matériel appartient à Drone Valais Production et est disponible pour les membres de l'équipe.
          </DialogDescription>
        </DialogHeader>
        <BookingForm 
          form={form}
          isPending={isPending}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};
