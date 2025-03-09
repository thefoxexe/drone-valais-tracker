
import { InvoiceForm } from "./InvoiceForm";
import { InvoiceTable } from "./invoice/InvoiceTable";
import { useInvoiceOperations } from "./invoice/useInvoiceOperations";

interface ServiceItem {
  description: string;
  amount: number;
  quantity: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  invoice_date: string;
  pdf_path?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  description?: string;
  rate_details?: ServiceItem[];
  vat_rate?: number;
}

interface InvoiceListProps {
  invoices: Invoice[];
  isQuote: boolean;
}

export const InvoiceList = ({ invoices, isQuote }: InvoiceListProps) => {
  const {
    editingInvoice,
    setEditingInvoice,
    handleDelete,
    handleStatusChange,
    handleDownload,
    regeneratePdf,
  } = useInvoiceOperations(isQuote);

  const handleInvoiceDownload = (invoice: Invoice) => {
    if (invoice.pdf_path) {
      handleDownload(invoice.pdf_path);
    } else if (invoice.id) {
      regeneratePdf(invoice.id);
    }
  };

  return (
    <>
      {editingInvoice && (
        <InvoiceForm
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
        />
      )}

      <InvoiceTable
        invoices={invoices}
        isQuote={isQuote}
        onEdit={setEditingInvoice}
        onDelete={handleDelete}
        onDownload={handleInvoiceDownload}
        onStatusChange={handleStatusChange}
        onRegeneratePdf={regeneratePdf}
      />
    </>
  );
};
