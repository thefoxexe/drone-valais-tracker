import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileType, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

export const ResourceList = () => {
  const [resourceToDelete, setResourceToDelete] = useState<{
    id: string;
    filePath: string;
    name: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: resources, isLoading } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("resources")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("resources")
        .remove([resourceToDelete.filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("resources")
        .delete()
        .eq("id", resourceToDelete.id);

      if (dbError) throw dbError;

      toast({
        title: "Succès",
        description: "Le fichier a été supprimé avec succès",
      });

      // Refresh the resources list
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
        variant: "destructive",
      });
    } finally {
      setResourceToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources?.map((resource) => (
          <Card key={resource.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {resource.type.startsWith("image/") ? (
                    <ImageIcon className="h-5 w-5" />
                  ) : (
                    <FileType className="h-5 w-5" />
                  )}
                  <span className="font-medium truncate" title={resource.name}>
                    {resource.name}
                  </span>
                </div>
              </div>
              {resource.type.startsWith("image/") && (
                <div className="relative aspect-video mb-4">
                  <img
                    src={`${
                      import.meta.env.VITE_SUPABASE_URL
                    }/storage/v1/object/public/resources/${resource.file_path}`}
                    alt={resource.name}
                    className="object-cover w-full h-full rounded-md"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDownload(resource.file_path, resource.name)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                <Button
                  variant="outline"
                  className="flex-none"
                  onClick={() =>
                    setResourceToDelete({
                      id: resource.id,
                      filePath: resource.file_path,
                      name: resource.name,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={resourceToDelete !== null}
        onOpenChange={() => setResourceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le fichier "{resourceToDelete?.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};