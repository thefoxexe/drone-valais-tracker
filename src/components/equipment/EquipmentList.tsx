
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EquipmentForm } from "./EquipmentForm";
import { EquipmentBookingForm } from "./EquipmentBookingForm";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Equipment = {
  id: string;
  name: string;
  type: "drone" | "camera" | "stabilizer" | "other";
  status: "available" | "maintenance" | "out_of_order";
};

export const EquipmentList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment, isLoading } = useQuery({
    queryKey: ["equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Equipment[];
    },
  });

  const { mutate: deleteEquipment } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("equipment").delete().eq("id", id);
      if (error) {
        console.error("Error deleting equipment:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast({
        title: "Matériel supprimé",
        description: "Le matériel a été supprimé avec succès",
      });
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression du matériel:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du matériel",
      });
    },
  });

  const getStatusColor = (status: Equipment["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-500";
      case "maintenance":
        return "bg-yellow-500/10 text-yellow-500";
      case "out_of_order":
        return "bg-red-500/10 text-red-500";
    }
  };

  const getStatusText = (status: Equipment["status"]) => {
    switch (status) {
      case "available":
        return "Disponible";
      case "maintenance":
        return "En maintenance";
      case "out_of_order":
        return "Hors service";
    }
  };

  const getTypeText = (type: Equipment["type"]) => {
    switch (type) {
      case "drone":
        return "Drone";
      case "camera":
        return "Caméra";
      case "stabilizer":
        return "Stabilisateur";
      case "other":
        return "Autre";
    }
  };

  if (isLoading) {
    return <div>Chargement du matériel...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <EquipmentForm />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>État</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment?.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{getTypeText(item.type)}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(item.status)}>
                  {getStatusText(item.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {item.status === "available" && (
                    <EquipmentBookingForm 
                      equipmentId={item.id} 
                      equipmentName={item.name}
                    />
                  )}
                  <EquipmentForm equipment={item} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer le matériel</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer {item.name} ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteEquipment(item.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!equipment?.length && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Aucun matériel disponible
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
