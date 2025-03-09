
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download, CheckCircle, XCircle, FileText } from "lucide-react";

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
  onRegeneratePdf?: (id: string) => void;
}

export const InvoiceActions = ({
  invoice,
  isQuote,
  onEdit,
  onDelete,
  onDownload,
  onStatusChange,
  onRegeneratePdf,
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
        title="Télécharger le PDF"
      >
        <Download className="h-4 w-4" />
      </Button>
      {onRegeneratePdf && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onRegeneratePdf(invoice.id)}
          title="Régénérer le PDF"
        >
          <FileText className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onEdit(invoice)}
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDelete(invoice.id)}
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
