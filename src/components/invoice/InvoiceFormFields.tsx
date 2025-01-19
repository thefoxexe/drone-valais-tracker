import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { UseFormRegister, FieldErrors, useFieldArray, Control } from "react-hook-form";

interface ServiceLine {
  description: string;
  amount: number;
}

interface InvoiceFormFieldsProps {
  register: UseFormRegister<any>;
  control: Control<any>;
  errors: FieldErrors;
  isQuote: boolean;
}

export const InvoiceFormFields = ({ 
  register, 
  control,
  errors,
  isQuote,
}: InvoiceFormFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rate_details"
  });

  const calculateTotal = (services: ServiceLine[]) => {
    const subtotal = services.reduce((sum, service) => sum + (service.amount || 0), 0);
    const tva = subtotal * 0.082; // 8.2% TVA
    return {
      subtotal: subtotal.toFixed(2),
      tva: tva.toFixed(2),
      total: (subtotal + tva).toFixed(2)
    };
  };

  const totals = calculateTotal(fields as ServiceLine[]);

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
        <Label>Services</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-4 mt-2">
            <div className="flex-grow">
              <Input
                placeholder="Description du service"
                {...register(`rate_details.${index}.description`, { 
                  required: "Description requise" 
                })}
              />
              {errors.rate_details?.[index]?.description && (
                <p className="text-sm text-red-500">
                  {errors.rate_details[index].description?.message as string}
                </p>
              )}
            </div>
            <div className="w-32">
              <Input
                type="number"
                step="0.01"
                placeholder="Montant"
                {...register(`rate_details.${index}.amount`, { 
                  required: "Montant requis",
                  valueAsNumber: true,
                  min: { value: 0, message: "Le montant doit être positif" }
                })}
              />
              {errors.rate_details?.[index]?.amount && (
                <p className="text-sm text-red-500">
                  {errors.rate_details[index].amount?.message as string}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => append({ description: "", amount: 0 })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un service
        </Button>
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex justify-between">
          <span>Sous-total:</span>
          <span>CHF {totals.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>TVA (8.2%):</span>
          <span>CHF {totals.tva}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>CHF {totals.total}</span>
        </div>
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
    </>
  );
};