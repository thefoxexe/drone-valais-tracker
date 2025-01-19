import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { InvoiceForm } from "./InvoiceForm";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  invoice_date: string;
  pdf_path?: string;
  status: string;
  rate_details?: Array<{ description: string; amount: number; }>;
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

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(invoice),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du PDF');
      }

      // Créer un blob à partir de la réponse
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire pour télécharger le fichier
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.status === 'approved' ? 'facture' : 'devis'}_${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Erreur lors du téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
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
                    onClick={() => handleDownloadPDF(invoice)}
                    title="Télécharger le PDF"
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