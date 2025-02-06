import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceList } from "@/components/InvoiceList";
import { Database } from "@/integrations/supabase/types";

type Invoice = Database['public']['Tables']['invoices']['Row'];

interface DashboardTabsProps {
  totalQuotes: number;
  totalInvoices: number;
  invoices: Invoice[];
}

export const DashboardTabs = ({ totalQuotes, totalInvoices, invoices }: DashboardTabsProps) => {
  const pendingQuotes = invoices.filter(invoice => invoice.status === 'pending');
  const approvedInvoices = invoices.filter(invoice => invoice.status === 'approved');

  return (
    <Tabs defaultValue="quotes" className="space-y-4">
      <TabsList className="w-full">
        <TabsTrigger value="quotes" className="flex-1 text-sm">
          Devis ({totalQuotes})
        </TabsTrigger>
        <TabsTrigger value="invoices" className="flex-1 text-sm">
          Factures ({totalInvoices})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="quotes" className="space-y-2">
        <InvoiceList invoices={pendingQuotes} isQuote={true} />
      </TabsContent>
      <TabsContent value="invoices" className="space-y-2">
        <InvoiceList invoices={approvedInvoices} isQuote={false} />
      </TabsContent>
    </Tabs>
  );
};