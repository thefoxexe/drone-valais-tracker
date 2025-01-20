import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceList } from "@/components/InvoiceList";
import { ResourceUpload } from "@/components/ResourceUpload";
import { ResourceList } from "@/components/ResourceList";
import { Database } from "@/integrations/supabase/types";

// Define the Invoice type based on the Supabase database schema
type Invoice = Database['public']['Tables']['invoices']['Row'];

interface DashboardTabsProps {
  totalQuotes: number;
  totalInvoices: number;
  quotes: Invoice[];
  invoices: Invoice[];
  onNewQuote: () => void;
}

export const DashboardTabs = ({ 
  totalQuotes, 
  totalInvoices, 
  quotes, 
  invoices, 
  onNewQuote 
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="quotes" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="quotes">Devis ({totalQuotes})</TabsTrigger>
        <TabsTrigger value="invoices">Factures ({totalInvoices})</TabsTrigger>
        <TabsTrigger value="resources">Ressources</TabsTrigger>
      </TabsList>
      <TabsContent value="quotes">
        <div className="flex justify-end mb-4">
          <Button onClick={onNewQuote} className="bg-white text-primary hover:bg-white/90">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Devis
          </Button>
        </div>
        <InvoiceList invoices={quotes} isQuote={true} />
      </TabsContent>
      <TabsContent value="invoices">
        <InvoiceList invoices={invoices} isQuote={false} />
      </TabsContent>
      <TabsContent value="resources">
        <div className="space-y-6">
          <ResourceUpload onUploadComplete={() => {
            window.location.reload();
          }} />
          <ResourceList />
        </div>
      </TabsContent>
    </Tabs>
  );
};