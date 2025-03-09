
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useEffect } from "react";

interface ServiceItem {
  description: string;
  amount: number;
  quantity: number;
}

interface InvoiceFormFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  isQuote: boolean;
  onFileChange: (file: File | null) => void;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
}

export const InvoiceFormFields = ({ 
  register, 
  errors, 
  isQuote,
  onFileChange,
  watch,
  setValue,
  services,
  setServices
}: InvoiceFormFieldsProps) => {
  const VAT_RATE = 8.1; // Taux de TVA 8.1%
  
  // Surveiller les changements dans les services pour recalculer le montant total
  useEffect(() => {
    const totalBeforeTax = services.reduce((sum, service) => {
      return sum + (service.amount * service.quantity);
    }, 0);
    
    const totalWithTax = totalBeforeTax * (1 + (VAT_RATE / 100));
    setValue("amount", parseFloat(totalWithTax.toFixed(2)));
    setValue("rate_details", services);
    setValue("vat_rate", VAT_RATE);
  }, [services, setValue, VAT_RATE]);

  // Ajouter un nouveau service vide
  const addService = () => {
    setServices([...services, { description: "", amount: 0, quantity: 1 }]);
  };

  // Supprimer un service
  const removeService = (index: number) => {
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };

  // Mettre à jour un service
  const updateService = (index: number, field: keyof ServiceItem, value: string | number) => {
    const updatedServices = [...services];
    
    if (field === "amount" || field === "quantity") {
      updatedServices[index][field] = Number(value);
    } else {
      updatedServices[index][field] = value as string;
    }
    
    setServices(updatedServices);
  };

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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Services</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addService}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Ajouter un service
          </Button>
        </div>

        {services.map((service, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-6">
              <Input
                placeholder="Description du service"
                value={service.description}
                onChange={(e) => updateService(index, "description", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="Prix"
                value={service.amount.toString()}
                onChange={(e) => updateService(index, "amount", e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="Quantité"
                value={service.quantity.toString()}
                onChange={(e) => updateService(index, "quantity", e.target.value)}
                min="1"
                step="1"
              />
            </div>
            <div className="col-span-1 text-right pt-2">
              <span className="text-sm font-medium">
                {(service.amount * service.quantity).toLocaleString('fr-CH', {
                  style: 'currency',
                  currency: 'CHF'
                })}
              </span>
            </div>
            <div className="col-span-1">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => removeService(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {services.length > 0 && (
          <div className="border-t pt-2 mt-4">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-9 text-right">
                <span className="text-sm">Sous-total:</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-sm font-medium">
                  {services.reduce((sum, service) => sum + (service.amount * service.quantity), 0).toLocaleString('fr-CH', {
                    style: 'currency',
                    currency: 'CHF'
                  })}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-9 text-right">
                <span className="text-sm">TVA ({VAT_RATE}%):</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-sm font-medium">
                  {(services.reduce((sum, service) => sum + (service.amount * service.quantity), 0) * (VAT_RATE / 100)).toLocaleString('fr-CH', {
                    style: 'currency',
                    currency: 'CHF'
                  })}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2 border-t mt-1 pt-1">
              <div className="col-span-9 text-right">
                <span className="text-sm font-bold">Total:</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="font-bold">
                  {(services.reduce((sum, service) => sum + (service.amount * service.quantity), 0) * (1 + (VAT_RATE / 100))).toLocaleString('fr-CH', {
                    style: 'currency',
                    currency: 'CHF'
                  })}
                </span>
              </div>
            </div>
          </div>
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

      <input type="hidden" {...register("amount")} />
      <input type="hidden" {...register("rate_details")} />
      <input type="hidden" {...register("vat_rate")} />
    </>
  );
};
