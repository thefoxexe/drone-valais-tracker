
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useUser } from "@clerk/clerk-react"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { RevenueChart } from "./RevenueChart"
import { DashboardHeader } from "./DashboardHeader"
import { DashboardShell } from "./DashboardShell"
import { RecentSales } from "./RecentSales"
import { useLocation } from "react-router-dom"

// Ajouter une fonction pour convertir les données de la facture
const mapInvoiceData = (invoice: any) => {
  // Conversion des rate_details en tableau s'il s'agit d'une chaîne JSON
  let rateDetails = [];
  if (typeof invoice.rate_details === 'string') {
    try {
      rateDetails = JSON.parse(invoice.rate_details);
    } catch (e) {
      console.error('Failed to parse rate_details:', e);
      rateDetails = [];
    }
  } else if (Array.isArray(invoice.rate_details)) {
    rateDetails = invoice.rate_details;
  }

  return {
    ...invoice,
    rate_details: rateDetails
  };
};

// Props for DashboardTabs
interface DashboardTabsProps {
  totalQuotes?: number;
  totalInvoices?: number;
  invoices?: any[];
}

export function DashboardTabs() {
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d")
  const { userId } = useUser()
  const location = useLocation();

  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      // Mapper les données pour s'assurer que rate_details est un tableau
      return data.map(mapInvoiceData);
    },
    enabled: !!userId,
  });

  const montlyRevenueQuery = useQuery({
    queryKey: ["monthly-revenue", timeframe],
    queryFn: async () => {
      const today = new Date()
      const from = new Date(
        today.setDate(today.getDate() - parseInt(timeframe.replace("d", "")))
      )

      const { data } = await supabase
        .from("invoices")
        .select("amount, created_at")
        .eq("user_id", userId)
        .gte("created_at", from.toISOString())
      return data
    },
    enabled: !!userId,
  })
  
  const quotes = invoicesData?.filter(invoice => invoice.status === 'pending') || [];
  const invoices = invoicesData?.filter(invoice => invoice.status === 'approved') || [];

  const isLoading = isLoadingInvoices || montlyRevenueQuery.isLoading

  if (location.pathname === '/dashboard/invoices' && isLoading) {
    return <div>Chargement des factures...</div>;
  }

  if (location.pathname === '/dashboard/quotes' && isLoading) {
    return <div>Chargement des devis...</div>;
  }

  return (
    <DashboardShell>
      <DashboardHeader
        title="Tableau de bord"
        description="Vue d'ensemble de vos activités"
        isLoading={isLoading}
        revenue={214000}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? "Loading..." : "$231,451.00"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>{isLoading ? "Loading..." : "+2350"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
          </CardHeader>
          <CardContent>{isLoading ? "Loading..." : "+12,234"}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Now</CardTitle>
          </CardHeader>
          <CardContent>{isLoading ? "Loading..." : "+234"}</CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={montlyRevenueQuery.data} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
      <Separator />
      <RecentSales data={invoicesData} isLoading={isLoading} />
    </DashboardShell>
  )
}
