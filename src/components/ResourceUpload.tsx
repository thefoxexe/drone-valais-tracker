import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const ResourceUpload = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un fichier",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('resources')
          .insert({
            name: file.name,
            file_path: filePath,
            type: file.type,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "Succès",
        description: `${files.length} fichier(s) ont été téléchargés avec succès`,
      });
      
      onUploadComplete();
      setFiles(null);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="files">Sélectionner des fichiers</Label>
        <Input
          id="files"
          type="file"
          onChange={(e) => setFiles(e.target.files)}
          accept="image/*,.pdf"
          multiple
        />
      </div>
      <Button 
        onClick={handleUpload} 
        disabled={!files || uploading}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Téléchargement..." : "Télécharger"}
      </Button>
    </div>
  );
};