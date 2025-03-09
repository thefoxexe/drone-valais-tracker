
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ServiceItem {
  description: string;
  amount: number;
  quantity: number;
}

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
    rate_details?: ServiceItem[];
    vat_rate?: number;
  };
}

export const useInvoiceForm = ({ onClose, invoice }: UseInvoiceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      invoice_number: invoice?.invoice_number || "",
      client_name: invoice?.client_name || "",
      amount: invoice?.amount || 0,
      invoice_date: invoice?.invoice_date ? new Date(invoice.invoice_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      rate_details: invoice?.rate_details || [],
      vat_rate: invoice?.vat_rate || 8.1,
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

  const generatePdf = async (invoiceId: string) => {
    try {
      const response = await fetch(
        'https://seearalooznyeqkbtgwv.supabase.co/functions/v1/generate-pdf',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
          },
          body: JSON.stringify({ invoice_id: invoiceId }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la génération du PDF');
      }
      
      return result.pdf_path;
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

      if (selectedFile) {
        // Générer un nom de fichier unique
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        // Télécharger le fichier dans le bucket "invoices"
        const { error: uploadError } = await supabase.storage
          .from('invoices')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;
        pdfPath = fileName;
      }

      if (invoice?.id) {
        const { error } = await supabase
          .from('invoices')
          .update({ 
            ...data, 
            pdf_path: pdfPath, 
            user_id: session.user.id,
            status: invoice.status || 'pending',
            invoice_date: data.invoice_date,
          })
          .eq('id', invoice.id);
        if (error) throw error;
      } else {
        const { data: insertData, error } = await supabase
          .from('invoices')
          .insert([{ 
            ...data, 
            pdf_path: pdfPath, 
            user_id: session.user.id,
            status: 'pending',
            invoice_date: data.invoice_date,
          }])
          .select();
        
        if (error) throw error;
        
        // Générer automatiquement un PDF si aucun n'est fourni
        if (!pdfPath && insertData && insertData.length > 0) {
          try {
            await generatePdf(insertData[0].id);
          } catch (pdfError) {
            console.error('Erreur lors de la génération automatique du PDF:', pdfError);
            // On continue même si la génération de PDF échoue
          }
        }
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
    watch,
    setValue,
  };
};
