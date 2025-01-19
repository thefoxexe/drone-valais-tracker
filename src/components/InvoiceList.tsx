import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { InvoiceForm } from "./InvoiceForm";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Json } from "@/integrations/supabase/types";

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
  rate_details?: Json;
}

interface InvoiceListProps {
  invoices: Invoice[];
  isQuote: boolean;
}

export const InvoiceList = ({ invoices, isQuote }: InvoiceListProps) => {
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    toast({
      title: "Succès",
      description: isQuote ? "Devis supprimé" : "Facture supprimée",
    });
  };

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from("invoices")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: `Impossible de ${newStatus === 'approved' ? 'valider' : 'rejeter'} le devis`,
        variant: "destructive",
      });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    toast({
      title: "Succès",
      description: newStatus === 'approved' ? "Devis transformé en facture" : "Devis rejeté",
    });
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      // If PDF doesn't exist, generate it first
      if (!invoice.pdf_path) {
        const { data: functionData, error: functionError } = await supabase.functions
          .invoke('generate-pdf', {
            body: { invoice_id: invoice.id }
          });

        if (functionError) {
          throw new Error('Erreur lors de la génération du PDF');
        }

        if (!functionData.pdf_path) {
          throw new Error('Erreur lors de la génération du PDF');
        }

        invoice.pdf_path = functionData.pdf_path;
      }

      // Download the PDF
      const { data, error } = await supabase.storage
        .from("invoices")
        .download(invoice.pdf_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = invoice.pdf_path.split("/").pop() || "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error);
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
                <TableCell className="text-right space-x-2">
                  {isQuote && invoice.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStatusChange(invoice.id, 'approved')}
                        title="Valider le devis"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStatusChange(invoice.id, 'rejected')}
                        title="Rejeter le devis"
                      >
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(invoice)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
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