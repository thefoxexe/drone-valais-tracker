import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download } from "lucide-react";
import { useState } from "react";
import { InvoiceForm } from "./InvoiceForm";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  invoice_date: string;
  pdf_path?: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
}

export const InvoiceList = ({ invoices }: InvoiceListProps) => {
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la facture",
        variant: "destructive",
      });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    toast({
      title: "Succès",
      description: "Facture supprimée",
    });
  };

  const handleDownload = async (pdfPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("invoices")
        .download(pdfPath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfPath.split("/").pop() || "facture.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le PDF",
        variant: "destructive",
      });
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
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
                <TableCell className="text-right space-x-2">
                  {invoice.pdf_path && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownload(invoice.pdf_path!)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingInvoice(invoice)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(invoice.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};