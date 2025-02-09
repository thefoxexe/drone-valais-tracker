
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

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
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

  // Effect to update form when invoice changes
  useEffect(() => {
    if (invoice) {
      setValue('invoice_number', invoice.invoice_number);
      setValue('client_name', invoice.client_name);
      setValue('amount', invoice.amount);
      setValue('invoice_date', invoice.invoice_date ? new Date(invoice.invoice_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    }
  }, [invoice, setValue]);

  const onSubmit = async (data: any) => {
    console.log("Submitting form with data:", data);
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

      // Format the date to YYYY-MM-DD
      const formattedDate = new Date(data.invoice_date).toISOString().split('T')[0];
      console.log("Formatted date:", formattedDate);

      if (invoice?.id) {
        console.log("Updating invoice with ID:", invoice.id);
        const { error } = await supabase
          .from('invoices')
          .update({ 
            invoice_number: data.invoice_number,
            client_name: data.client_name,
            amount: data.amount,
            pdf_path: pdfPath,
            user_id: session.user.id,
            status: invoice.status || 'pending',
            invoice_date: formattedDate,
          })
          .eq('id', invoice.id);

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
      } else {
        console.log("Creating new invoice");
        const { error } = await supabase
          .from('invoices')
          .insert([{ 
            invoice_number: data.invoice_number,
            client_name: data.client_name,
            amount: data.amount,
            pdf_path: pdfPath,
            user_id: session.user.id,
            status: 'pending',
            invoice_date: formattedDate,
          }]);

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
      }

      // Force refresh both queries
      console.log("Invalidating queries...");
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
      await queryClient.invalidateQueries({ queryKey: ["monthly-revenue"] });
      
      toast({
        title: "Succès",
        description: invoice ? "Document mis à jour" : "Devis créé",
      });
      onClose();
    } catch (error: any) {
      console.error("Form submission error:", error);
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
