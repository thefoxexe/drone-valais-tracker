
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UseInvoiceFormProps {
  onClose: () => void;
  invoice?: {
    id: string;
    invoice_number: string;
    client_name: string;
    amount: number;
    invoice_date?: string;
    pdf_path?: string;
    status?: string;
  };
}

export const useInvoiceForm = ({ onClose, invoice }: UseInvoiceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      invoice_number: invoice?.invoice_number || "",
      client_name: invoice?.client_name || "",
      amount: invoice?.amount || 0,
      invoice_date: invoice?.invoice_date ? new Date(invoice.invoice_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
        });
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
        });
        navigate("/login");
        return;
      }

      let pdfPath = invoice?.pdf_path;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
        pdfPath = fileName;
      }

      // Insert or update invoice
      let invoiceId = invoice?.id;
      if (invoice?.id) {
        const { error } = await supabase
          .from('invoices')
          .update({ 
            invoice_number: data.invoice_number,
            client_name: data.client_name,
            pdf_path: pdfPath, 
            user_id: session.user.id,
            status: invoice.status || 'pending',
            invoice_date: data.invoice_date,
            total_ht: data.totalHT,
            total_ttc: data.totalTTC,
            tva_rate: data.tvaRate
          })
          .eq('id', invoice.id);
        if (error) throw error;
      } else {
        const { data: newInvoice, error } = await supabase
          .from('invoices')
          .insert([{ 
            invoice_number: data.invoice_number,
            client_name: data.client_name,
            pdf_path: pdfPath, 
            user_id: session.user.id,
            status: 'pending',
            invoice_date: data.invoice_date,
            total_ht: data.totalHT,
            total_ttc: data.totalTTC,
            tva_rate: data.tvaRate
          }])
          .select()
          .single();
        if (error) throw error;
        invoiceId = newInvoice.id;
      }

      // Insert lines if invoice created successfully
      if (invoiceId && data.lines) {
        // D'abord supprimer les anciennes lignes si c'est une mise à jour
        if (invoice?.id) {
          const { error: deleteError } = await supabase
            .from('invoice_lines')
            .delete()
            .eq('invoice_id', invoiceId);
          if (deleteError) throw deleteError;
        }

        // Insérer les nouvelles lignes
        const { error: linesError } = await supabase
          .from('invoice_lines')
          .insert(
            data.lines.map((line: any) => ({
              invoice_id: invoiceId,
              description: line.description,
              quantity: line.quantity,
              unit_price: line.unit_price,
              total: line.total
            }))
          );
        if (linesError) throw linesError;
      }

      // Generate PDF
      const { error: pdfError } = await supabase.functions.invoke('generate-pdf', {
        body: { invoice_id: invoiceId }
      });

      if (pdfError) {
        console.error('Error generating PDF:', pdfError);
        toast({
          title: "Attention",
          description: "Le document a été sauvegardé mais il y a eu une erreur lors de la génération du PDF",
          variant: "destructive",
        });
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["invoices"] }),
        queryClient.invalidateQueries({ queryKey: ["monthly-revenue"] })
      ]);
      
      toast({
        title: "Succès",
        description: invoice ? "Document mis à jour" : "Devis créé",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    setSelectedFile,
  };
};
