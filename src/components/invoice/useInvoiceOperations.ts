import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useInvoiceOperations = (isQuote: boolean) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingInvoice, setEditingInvoice] = useState<any>(null);

  const handleDelete = async (id: string) => {
    try {
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .eq("invoice_id", id);

      if (projects && projects.length > 0) {
        const { error: projectError } = await supabase
          .from("projects")
          .delete()
          .eq("invoice_id", id);

        if (projectError) {
          toast({
            title: "Erreur",
            description: "Impossible de supprimer le projet associé",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le document",
          variant: "destructive",
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Succès",
        description: isQuote ? "Devis supprimé" : "Facture supprimée",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: `Impossible de ${newStatus === 'approved' ? 'valider' : 'rejeter'} le devis`,
        variant: "destructive",
      });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    toast({
      title: "Succès",
      description: newStatus === 'approved' ? "Devis transformé en facture" : "Devis rejeté",
    });
  };

  const handleDownload = async (invoice: any) => {
    try {
      if (!invoice.pdf_path) {
        const { data: functionData, error: functionError } = await supabase.functions
          .invoke('generate-pdf', {
            body: { invoice_id: invoice.id }
          });

        if (functionError) {
          throw new Error('Erreur lors de la génération du PDF');
        }

        if (!functionData.pdf_path) {
          throw new Error('Erreur lors de la génération du PDF');
        }

        invoice.pdf_path = functionData.pdf_path;
      }

      const { data, error } = await supabase.storage
        .from("invoices")
        .download(invoice.pdf_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = invoice.pdf_path.split("/").pop() || "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le PDF",
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