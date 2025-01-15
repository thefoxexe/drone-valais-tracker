import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface InvoiceFormProps {
  onClose: () => void;
  invoice?: {
    id: string;
    invoice_number: string;
    client_name: string;
    amount: number;
    pdf_path?: string;
  };
}

export const InvoiceForm = ({ onClose, invoice }: InvoiceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: invoice || {
      invoice_number: "",
      client_name: "",
      amount: 0,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
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

      if (invoice?.id) {
        const { error } = await supabase
          .from('invoices')
          .update({ ...data, pdf_path: pdfPath })
          .eq('id', invoice.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('invoices')
          .insert([{ ...data, pdf_path: pdfPath }]);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast({
        title: "Succès",
        description: invoice ? "Facture mise à jour" : "Facture créée",
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{invoice ? "Modifier la facture" : "Nouvelle facture"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="invoice_number">Numéro de facture</Label>
            <Input
              id="invoice_number"
              {...register("invoice_number", { required: "Ce champ est requis" })}
            />
            {errors.invoice_number && (
              <p className="text-sm text-red-500">{errors.invoice_number.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="client_name">Nom du client</Label>
            <Input
              id="client_name"
              {...register("client_name", { required: "Ce champ est requis" })}
            />
            {errors.client_name && (
              <p className="text-sm text-red-500">{errors.client_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Montant (CHF)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { 
                required: "Ce champ est requis",
                valueAsNumber: true 
              })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pdf">PDF de la facture</Label>
            <Input
              id="pdf"
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};