
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceFormFields } from "./invoice/InvoiceFormFields";
import { InvoiceFormActions } from "./invoice/InvoiceFormActions";
import { useInvoiceForm } from "./invoice/useInvoiceForm";
import { useState } from "react";

interface InvoiceLine {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceFormProps {
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

export const InvoiceForm = ({ onClose, invoice }: InvoiceFormProps) => {
  const [lines, setLines] = useState<InvoiceLine[]>([
    { description: "", quantity: 1, unit_price: 0, total: 0 }
  ]);

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit: originalOnSubmit,
    setSelectedFile,
  } = useInvoiceForm({ onClose, invoice });

  // Calculer les totaux basés sur les lignes
  const totalHT = lines.reduce((sum, line) => sum + line.total, 0);
  const tvaRate = 8.1;
  const totalTTC = totalHT * (1 + tvaRate / 100);

  // Wrapper pour ajouter les lignes et totaux aux données du formulaire
  const onSubmit = async (data: any) => {
    const formData = {
      ...data,
      lines,
      totalHT,
      totalTTC,
      tvaRate
    };
    await originalOnSubmit(formData);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{invoice ? "Modifier le document" : "Nouveau devis"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InvoiceFormFields
            register={register}
            errors={errors}
            isQuote={!invoice?.status || invoice.status !== 'approved'}
            onFileChange={setSelectedFile}
            lines={lines}
            onLinesChange={setLines}
            totalHT={totalHT}
            tvaRate={tvaRate}
            totalTTC={totalTTC}
          />
          <InvoiceFormActions
            onClose={onClose}
            isSubmitting={isSubmitting}
          />
        </form>
      </CardContent>
    </Card>
  );
};
