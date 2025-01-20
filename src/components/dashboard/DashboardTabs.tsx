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
      <TabsList>
        <TabsTrigger value="quotes">
          Devis ({totalQuotes})
        </TabsTrigger>
        <TabsTrigger value="invoices">
          Factures ({totalInvoices})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="quotes">
        <InvoiceList invoices={pendingQuotes} isQuote={true} />
      </TabsContent>
      <TabsContent value="invoices">
        <InvoiceList invoices={approvedInvoices} isQuote={false} />
      </TabsContent>
    </Tabs>
  );
};