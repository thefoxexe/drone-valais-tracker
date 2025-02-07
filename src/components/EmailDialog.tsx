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
import { ScrollArea } from "@/components/ui/scroll-area";

export const EmailDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateEmail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-email', {
        body: { prompt: prompt || "Générer un email sympathique et professionnel" }
      });

      if (error) throw error;

      if (data?.email) {
        setGeneratedEmail(data.email);
        toast({
          title: "Email généré",
          description: "L'email a été généré avec succès",
        });
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Générer un email</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 flex-grow">
          <Textarea
            placeholder="Entrez votre requête pour la génération d'email..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleGenerateEmail} disabled={loading}>
            {loading ? "Génération en cours..." : "Générer l'email"}
          </Button>
          {generatedEmail && (
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap">{generatedEmail}</div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};