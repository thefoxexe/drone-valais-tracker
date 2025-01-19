import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface InvoiceFormFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  isQuote: boolean;
  onFileChange: (file: File | null) => void;
}

export const InvoiceFormFields = ({ 
  register, 
  errors, 
  isQuote,
  onFileChange 
}: InvoiceFormFieldsProps) => {
  return (
    <>
      <div>
        <Label htmlFor="invoice_number">Numéro de {isQuote ? 'devis' : 'facture'}</Label>
        <Input
          id="invoice_number"
          {...register("invoice_number", { required: "Ce champ est requis" })}
        />
        {errors.invoice_number && (
          <p className="text-sm text-red-500">{errors.invoice_number.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="client_name">Nom du client</Label>
        <Input
          id="client_name"
          {...register("client_name", { required: "Ce champ est requis" })}
        />
        {errors.client_name && (
          <p className="text-sm text-red-500">{errors.client_name.message as string}</p>
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
          <p className="text-sm text-red-500">{errors.amount.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="invoice_date">Date</Label>
        <Input
          id="invoice_date"
          type="date"
          {...register("invoice_date", { required: "Ce champ est requis" })}
        />
        {errors.invoice_date && (
          <p className="text-sm text-red-500">{errors.invoice_date.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="pdf">PDF du {isQuote ? 'devis' : 'facture'}</Label>
        <Input
          id="pdf"
          type="file"
          accept=".pdf"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />
      </div>
    </>
  );
};