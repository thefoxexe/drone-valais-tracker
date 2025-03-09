
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceFormFields } from "./invoice/InvoiceFormFields";
import { InvoiceFormActions } from "./invoice/InvoiceFormActions";
import { useInvoiceForm } from "./invoice/useInvoiceForm";
import { useState } from "react";

interface ServiceItem {
  description: string;
  amount: number;
  quantity: number;
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
    rate_details?: ServiceItem[];
    vat_rate?: number;
  };
}

export const InvoiceForm = ({ onClose, invoice }: InvoiceFormProps) => {
  const [services, setServices] = useState<ServiceItem[]>(
    invoice?.rate_details && invoice.rate_details.length > 0
      ? invoice.rate_details
      : [{ description: "", amount: 0, quantity: 1 }]
  );

  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    setSelectedFile,
    watch,
    setValue,
  } = useInvoiceForm({ onClose, invoice });

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
            watch={watch}
            setValue={setValue}
            services={services}
            setServices={setServices}
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
