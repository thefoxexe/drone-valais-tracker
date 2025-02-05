import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InvoiceForm } from "../InvoiceForm";
import { ResourceDialog } from "../ResourceDialog";

interface ModalFormsProps {
  showInvoiceForm: boolean;
  setShowInvoiceForm: (show: boolean) => void;
  showResourceDialog: boolean;
  setShowResourceDialog: (show: boolean) => void;
}

export const ModalForms = ({
  showInvoiceForm,
  setShowInvoiceForm,
  showResourceDialog,
  setShowResourceDialog,
}: ModalFormsProps) => {
  return (
    <>
      <Sheet open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Nouveau devis</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <InvoiceForm onClose={() => setShowInvoiceForm(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <ResourceDialog 
        open={showResourceDialog} 
        onOpenChange={setShowResourceDialog} 
      />
    </>
  );
};