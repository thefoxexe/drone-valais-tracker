import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDropzone } from "react-dropzone";

export const ResourceUpload = ({ onUploadComplete }: { onUploadComplete: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
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
      for (const file of acceptedFiles) {
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
        description: `${acceptedFiles.length} fichier(s) ont été téléchargés avec succès`,
      });
      
      onUploadComplete();
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
  }, [toast, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': ['.pdf']
    }
  });

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-white/20'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-white mb-4" />
        <div className="text-white">
          {isDragActive ? (
            <p>Déposez les fichiers ici ...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-1">
                Glissez et déposez vos fichiers ici
              </p>
              <p className="text-sm opacity-70">
                ou cliquez pour sélectionner des fichiers
              </p>
            </>
          )}
        </div>
      </div>
      <Button 
        onClick={() => {
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) fileInput.click();
        }} 
        disabled={uploading}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? "Téléchargement..." : "Sélectionner des fichiers"}
      </Button>
    </div>
  );
};