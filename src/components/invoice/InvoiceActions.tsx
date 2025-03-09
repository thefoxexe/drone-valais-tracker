import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download, CheckCircle, XCircle } from "lucide-react";

interface InvoiceActionsProps {
  invoice: {
    id: string;
    status?: string;
    pdf_path?: string;
  };
  isQuote: boolean;
  onEdit: (invoice: any) => void;
  onDelete: (id: string) => void;
  onDownload: (invoice: any) => void;
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void;
}

export const InvoiceActions = ({
  invoice,
  isQuote,
  onEdit,
  onDelete,
  onDownload,
  onStatusChange,
}: InvoiceActionsProps) => {
  return (
    <div className="space-x-2">
      {isQuote && invoice.status === 'pending' && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onStatusChange(invoice.id, 'approved')}
            title="Valider le devis"
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onStatusChange(invoice.id, 'rejected')}
            title="Rejeter le devis"
          >
            <XCircle className="h-4 w-4 text-red-500" />
          </Button>
        </>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDownload(invoice)}
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onEdit(invoice)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDelete(invoice.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};