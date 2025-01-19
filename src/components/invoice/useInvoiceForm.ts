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
    description?: string;
    rate_details?: string;
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
      description: invoice?.description || "",
      rate_details: invoice?.rate_details || "",
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

  const generatePDF = async (data: any) => {
    try {
      const response = await fetch('https://seearalooznyeqkbtgwv.supabase.co/functions/v1/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          invoice_number: data.invoice_number,
          client_name: data.client_name,
          amount: data.amount,
          invoice_date: data.invoice_date,
          description: data.description,
          rate_details: data.rate_details,
        })
      });

      if (!response.ok) throw new Error('Erreur lors de la génération du PDF');

      const blob = await response.blob();
      const file = new File([blob], `devis_${data.invoice_number}.pdf`, { type: 'application/pdf' });
      return file;

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw error;
    }
  };

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

      // Si un fichier est sélectionné manuellement, on l'utilise
      // Sinon, on génère un nouveau PDF
      const fileToUpload = selectedFile || await generatePDF(data);
      
      if (fileToUpload) {
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(fileName, fileToUpload);

        if (uploadError) throw uploadError;
        pdfPath = fileName;
      }

      const rateDetailsJson = data.rate_details ? JSON.stringify({ details: data.rate_details }) : null;

      if (invoice?.id) {
        const { error } = await supabase
          .from('invoices')
          .update({ 
            ...data, 
            pdf_path: pdfPath,
            rate_details: rateDetailsJson,
            user_id: session.user.id,
            status: invoice.status || 'pending'
          })
          .eq('id', invoice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('invoices')
          .insert([{ 
            ...data, 
            pdf_path: pdfPath,
            rate_details: rateDetailsJson,
            user_id: session.user.id,
            status: 'pending'
          }]);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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