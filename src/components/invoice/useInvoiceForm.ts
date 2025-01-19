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
    rate_details?: Array<{ description: string; amount: number; }>;
  };
}

export const useInvoiceForm = ({ onClose, invoice }: UseInvoiceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      invoice_number: invoice?.invoice_number || "",
      client_name: invoice?.client_name || "",
      invoice_date: invoice?.invoice_date ? new Date(invoice.invoice_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      rate_details: invoice?.rate_details || [{ description: "", amount: 0 }]
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

      // Calculer le montant total avec TVA
      const subtotal = data.rate_details.reduce((sum: number, service: { amount: number }) => 
        sum + (service.amount || 0), 0);
      const total = subtotal * 1.082; // Ajout de la TVA de 8.2%

      const invoiceData = {
        invoice_number: data.invoice_number,
        client_name: data.client_name,
        invoice_date: data.invoice_date,
        rate_details: data.rate_details,
        amount: total,
        user_id: session.user.id,
        status: invoice?.status || 'pending'
      };

      if (invoice?.id) {
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('invoices')
          .insert([invoiceData]);
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
    control,
    errors,
    isSubmitting,
    onSubmit,
  };
};