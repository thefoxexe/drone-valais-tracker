import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ResourceList = () => {
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

  const handleDelete = async (id: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from("resources")
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("resources")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      toast({
        title: "Succès",
        description: "Le fichier a été supprimé avec succès",
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("resources")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const categories = {
    templates: "Modèles",
    logos: "Logos",
    sources: "Fichiers source",
    general: "Général"
  };

  const ResourceCard = ({ resource }: { resource: any }) => (
    <div
      key={resource.id}
      className="flex items-start space-x-4 p-4 rounded-lg border border-white/10 bg-white/5"
    >
      <div className="flex-shrink-0">
        {resource.type.startsWith("image/") ? (
          <div className="relative w-20 h-20">
            <img
              src={getFileUrl(resource.file_path)}
              alt={resource.name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-white/5 rounded-md">
            <FileText className="w-8 h-8 text-white/70" />
          </div>
        )}
      </div>
      <div className="flex-grow">
        <h3 className="text-sm font-medium text-white truncate">
          {resource.name}
        </h3>
        <p className="text-xs text-white/70">
          {new Date(resource.created_at).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
            onClick={() => handleDelete(resource.id, resource.file_path)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Tabs defaultValue="templates" className="w-full">
      <TabsList className="w-full">
        {Object.entries(categories).map(([key, label]) => (
          <TabsTrigger key={key} value={key} className="flex-1">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.keys(categories).map((category) => (
        <TabsContent key={category} value={category}>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {resources
                ?.filter(resource => resource.category === category)
                .map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
};