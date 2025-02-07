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
  const [receivedEmail, setReceivedEmail] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateEmail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-email', {
        body: { 
          receivedEmail,
          keyPoints,
          signature: {
            name: "Bastien Ryser",
            company: "Drone Valais Production",
            website: "www.dronevalais-production.ch"
          }
        }
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
          <div>
            <label className="block text-sm font-medium mb-2">
              Email reçu
            </label>
            <Textarea
              placeholder="Collez ici l'email reçu..."
              value={receivedEmail}
              onChange={(e) => setReceivedEmail(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Points clés de la réponse
            </label>
            <Textarea
              placeholder="Écrivez rapidement les points importants pour la réponse (ex: pas intéressé par le produit)..."
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleGenerateEmail} disabled={loading}>
            {loading ? "Génération en cours..." : "Générer l'email"}
          </Button>

          {generatedEmail && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Email généré
              </label>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="whitespace-pre-wrap">{generatedEmail}</div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};