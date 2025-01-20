import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceList } from "@/components/InvoiceList";
import { Database } from "@/integrations/supabase/types";

// Define the Invoice type based on the Supabase database schema
type Invoice = Database['public']['Tables']['invoices']['Row'];

interface DashboardTabsProps {
  totalQuotes: number;
  totalInvoices: number;
  invoices: Invoice[];
}

export const DashboardTabs = ({ totalQuotes, totalInvoices, invoices }: DashboardTabsProps) => {
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
        <InvoiceList invoices={invoices.filter(invoice => invoice.status === 'pending')} />
      </TabsContent>
      <TabsContent value="invoices">
        <InvoiceList invoices={invoices.filter(invoice => invoice.status === 'paid')} />
      </TabsContent>
    </Tabs>
  );
};