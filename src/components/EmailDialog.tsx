import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EmailDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateEmail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-email', {
        body: { prompt: prompt || "Générer un email sympathique et professionnel" }
      });

      if (error) throw error;

      if (data?.email) {
        toast({
          title: "Email généré",
          description: "L'email a été généré avec succès. Vous pouvez le copier depuis la console.",
        });
        console.log("Email généré:", data.email);
      }
    } catch (error) {
      console.error('Error generating email:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Générer un email</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Entrez votre requête pour la génération d'email..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleGenerateEmail} disabled={loading}>
            {loading ? "Génération en cours..." : "Générer l'email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};