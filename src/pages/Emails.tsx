
import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Emails = () => {
  const [receivedEmail, setReceivedEmail] = useState("");
  const [intention, setIntention] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handleGenerateResponse = async () => {
    if (!receivedEmail || !intention || !userEmail) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs et vous assurer d'être connecté",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-email", {
        body: {
          receivedEmail,
          intention,
          userEmail,
        },
      });

      if (error) throw error;

      if (data?.email) {
        setGeneratedResponse(data.email);
        toast({
          title: "Succès",
          description: "Réponse générée avec succès",
        });
      }
    } catch (error) {
      console.error("Error generating email:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la réponse",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/lovable-uploads/deccad97-d3eb-4324-b51b-6bde7ebac742.png')",
      }}
    >
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <Card className="bg-background/80 backdrop-blur-sm border-white/10 p-6">
          <h1 className="text-2xl font-bold mb-6">Générateur d'Emails Professionnels</h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Reçu
              </label>
              <Textarea
                placeholder="Collez ici l'email reçu..."
                value={receivedEmail}
                onChange={(e) => setReceivedEmail(e.target.value)}
                className="min-h-[200px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Instructions pour la réponse
              </label>
              <Textarea
                placeholder="Décrivez comment vous souhaitez répondre (ex: refuser poliment car le prix est trop élevé, demander plus de détails sur les délais...)"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button 
              onClick={handleGenerateResponse} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Génération en cours..." : "Générer la réponse"}
            </Button>

            {generatedResponse && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Réponse Générée
                </label>
                <Textarea
                  value={generatedResponse}
                  onChange={(e) => setGeneratedResponse(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Emails;
