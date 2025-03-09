
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

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", invoiceId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    toast({
      title: "Succès",
      description: "Statut mis à jour",
    });
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

  return {
    editingInvoice,
    setEditingInvoice,
    handleDelete,
    handleStatusChange,
    handleDownload,
  };
};
