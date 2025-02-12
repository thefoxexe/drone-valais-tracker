
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const equipmentSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.enum(["drone", "camera", "stabilizer", "other"]),
  status: z.enum(["available", "maintenance", "out_of_order"]),
});

type EquipmentFormValues = z.infer<typeof equipmentSchema>;

type Equipment = {
  id: string;
  name: string;
  type: "drone" | "camera" | "stabilizer" | "other";
  status: "available" | "maintenance" | "out_of_order";
};

interface EquipmentFormProps {
  equipment?: Equipment;
}

export const EquipmentForm = ({ equipment }: EquipmentFormProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: equipment?.name || "",
      type: equipment?.type || "drone",
      status: equipment?.status || "available",
    },
  });

  const { mutate: upsertEquipment, isPending } = useMutation({
    mutationFn: async (values: EquipmentFormValues) => {
      const { data, error } = await supabase
        .from("equipment")
        .upsert({
          id: equipment?.id,
          name: values.name,
          type: values.type,
          status: values.status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: equipment ? "Matériel modifié" : "Matériel ajouté",
        description: equipment 
          ? "Le matériel a été modifié avec succès" 
          : "Le matériel a été ajouté avec succès",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      console.error("Erreur lors de l'opération sur le matériel:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération sur le matériel",
      });
    },
  });

  const onSubmit = (values: EquipmentFormValues) => {
    upsertEquipment(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {equipment ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter du matériel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {equipment ? "Modifier le matériel" : "Ajouter du matériel"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="DJI Mavic 3..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="drone">Drone</SelectItem>
                      <SelectItem value="camera">Caméra</SelectItem>
                      <SelectItem value="stabilizer">Stabilisateur</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>État</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un état" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="maintenance">En maintenance</SelectItem>
                      <SelectItem value="out_of_order">Hors service</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending 
                ? (equipment ? "Modification en cours..." : "Ajout en cours...") 
                : (equipment ? "Modifier" : "Ajouter")
              }
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
