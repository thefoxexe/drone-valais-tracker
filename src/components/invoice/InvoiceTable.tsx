import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { InvoiceActions } from "./InvoiceActions";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  invoice_date: string;
  pdf_path?: string;
  status: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  isQuote: boolean;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onDownload: (invoice: Invoice) => void;
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void;
}

export const InvoiceTable = ({
  invoices,
  isQuote,
  onEdit,
  onDelete,
  onDownload,
  onStatusChange,
}: InvoiceTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° {isQuote ? 'Devis' : 'Facture'}</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow 
              key={invoice.id}
              className={cn(
                invoice.status === 'rejected' && "line-through opacity-50"
              )}
            >
              <TableCell>{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.client_name}</TableCell>
              <TableCell>
                {Number(invoice.amount).toLocaleString('fr-CH', {
                  style: 'currency',
                  currency: 'CHF'
                })}
              </TableCell>
              <TableCell>
                {new Date(invoice.invoice_date).toLocaleDateString('fr-CH')}
              </TableCell>
              <TableCell className="text-right">
                <InvoiceActions
                  invoice={invoice}
                  isQuote={isQuote}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDownload={onDownload}
                  onStatusChange={onStatusChange}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};