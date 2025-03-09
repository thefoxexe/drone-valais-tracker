
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useInvoiceOperations = (isQuote: boolean) => {
  const [editingInvoice, setEditingInvoice] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async (invoiceId: string) => {
    try {
      // First, get the project associated with this invoice
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .eq("invoice_id", invoiceId);

      if (projects && projects.length > 0) {
        const projectId = projects[0].id;

        // Delete all tasks associated with the project
        const { error: tasksError } = await supabase
          .from("project_tasks")
          .delete()
          .eq("project_id", projectId);

        if (tasksError) {
          console.error("Error deleting tasks:", tasksError);
          throw tasksError;
        }

        // Delete the project
        const { error: projectError } = await supabase
          .from("projects")
          .delete()
          .eq("id", projectId);

        if (projectError) {
          console.error("Error deleting project:", projectError);
          throw projectError;
        }
      }

      // Finally delete the invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);

      if (invoiceError) {
        console.error("Error deleting invoice:", invoiceError);
        throw invoiceError;
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Succès",
        description: isQuote ? "Devis supprimé" : "Facture supprimée",
      });
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast({
        title: "Erreur",
        description: isQuote 
          ? "Impossible de supprimer le devis" 
          : "Impossible de supprimer la facture",
        variant: "destructive",
      });
    }
  };

  const generatePdf = async (invoiceId: string) => {
    try {
      const response = await fetch(
        'https://seearalooznyeqkbtgwv.supabase.co/functions/v1/generate-pdf',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ invoice_id: invoiceId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la génération du PDF');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      // Si on approuve un devis, générer d'abord le PDF de la facture
      if (newStatus === 'approved') {
        try {
          await generatePdf(invoiceId);
        } catch (error) {
          console.error('Erreur lors de la génération du PDF:', error);
          // On continue même si la génération de PDF échoue
        }
      }

      const { error } = await supabase
        .from("invoices")
        .update({ status: newStatus })
        .eq("id", invoiceId);

      if (error) {
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      
      if (newStatus === 'approved') {
        toast({
          title: "Succès",
          description: "Le devis a été transformé en facture",
        });
      } else {
        toast({
          title: "Succès",
          description: "Statut mis à jour",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (pdfPath: string) => {
    try {
      console.log("Downloading file path:", pdfPath);
      
      // Vérifier si le chemin du fichier est valide
      if (!pdfPath || pdfPath.trim() === '') {
        toast({
          title: "Erreur",
          description: "Chemin de fichier invalide",
          variant: "destructive",
        });
        return;
      }

      // Récupérer l'URL publique du fichier
      const { data } = supabase.storage
        .from("invoices")
        .getPublicUrl(pdfPath);

      if (!data?.publicUrl) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer l'URL du fichier",
          variant: "destructive",
        });
        return;
      }

      // Ouvrir l'URL dans un nouvel onglet
      window.open(data.publicUrl, '_blank');
      
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    }
  };

  const regeneratePdf = async (invoiceId: string) => {
    try {
      toast({
        title: "Génération en cours",
        description: "Le PDF est en cours de génération...",
      });

      const result = await generatePdf(invoiceId);
      
      if (result.success) {
        toast({
          title: "Succès",
          description: "PDF généré avec succès",
        });
        
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        return result.pdf_path;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive",
      });
    }
    return null;
  };

  return {
    editingInvoice,
    setEditingInvoice,
    handleDelete,
    handleStatusChange,
    handleDownload,
    regeneratePdf,
  };
};
