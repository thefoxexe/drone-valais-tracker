import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileType, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ResourceList = () => {
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

      // Create a download link
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
    }
  };

  if (isLoading) {
    return <div className="text-center">Chargement...</div>;
  }

  return (
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
                  src={`${supabase.storage.from("resources").getPublicUrl(resource.file_path).data.publicUrl}`}
                  alt={resource.name}
                  className="object-cover w-full h-full rounded-md"
                />
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDownload(resource.file_path, resource.name)}
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};