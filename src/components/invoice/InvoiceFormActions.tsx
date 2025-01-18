import { Button } from "@/components/ui/button";

interface InvoiceFormActionsProps {
  onClose: () => void;
  isSubmitting: boolean;
}

export const InvoiceFormActions = ({ onClose, isSubmitting }: InvoiceFormActionsProps) => {
  return (
    <div className="flex justify-end gap-4">
      <Button type="button" variant="outline" onClick={onClose}>
        Annuler
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </div>
  );
};