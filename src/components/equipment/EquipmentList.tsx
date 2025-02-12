
import { useQuery } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Equipment = {
  id: string;
  name: string;
  type: "drone" | "camera" | "stabilizer" | "other";
  status: "available" | "maintenance" | "out_of_order";
};

export const EquipmentList = () => {
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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter du matériel
        </Button>
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
                <Button variant="ghost" size="sm">
                  Réserver
                </Button>
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
