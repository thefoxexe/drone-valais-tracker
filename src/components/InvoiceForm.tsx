import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceFormFields } from "./invoice/InvoiceFormFields";
import { InvoiceFormActions } from "./invoice/InvoiceFormActions";
import { useInvoiceForm } from "./invoice/useInvoiceForm";

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
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    setSelectedFile,
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