
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { InvoiceLineForm } from "./InvoiceLineForm";
import { InvoiceTotals } from "./InvoiceTotals";

interface InvoiceLine {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceFormFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  isQuote: boolean;
  onFileChange: (file: File | null) => void;
  lines: InvoiceLine[];
  onLinesChange: (lines: InvoiceLine[]) => void;
  totalHT: number;
  tvaRate: number;
  totalTTC: number;
}

export const InvoiceFormFields = ({ 
  register, 
  errors, 
  isQuote,
  onFileChange,
  lines,
  onLinesChange,
  totalHT,
  tvaRate,
  totalTTC
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

      <div className="space-y-2">
        <Label>Lignes du {isQuote ? 'devis' : 'facture'}</Label>
        <InvoiceLineForm
          lines={lines}
          onChange={onLinesChange}
        />
      </div>

      <div className="mt-6">
        <InvoiceTotals
          totalHT={totalHT}
          tvaRate={tvaRate}
          totalTTC={totalTTC}
        />
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
