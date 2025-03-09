
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

interface RecentSalesProps {
  data: any[] | undefined;
  isLoading: boolean;
}

export function RecentSales({ data, isLoading }: RecentSalesProps) {
  const recentInvoices = data?.slice(0, 5) || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Chargement des données...</p>
        ) : recentInvoices.length === 0 ? (
          <p>Aucune vente récente</p>
        ) : (
          <div className="space-y-8">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center">
                <Avatar className="h-9 w-9 mr-3">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-white">
                    {invoice.client_name.charAt(0).toUpperCase()}
                  </div>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{invoice.client_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.invoice_number || `Facture #${invoice.id.slice(0, 8)}`}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  {Number(invoice.amount).toLocaleString("fr-CH", {
                    style: "currency",
                    currency: "CHF",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
