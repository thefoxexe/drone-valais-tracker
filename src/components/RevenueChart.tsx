import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const RevenueChart = () => {
  const { data: monthlyRevenue } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("amount, invoice_date")
        .order("invoice_date", { ascending: true });

      if (error) throw error;

      const monthlyData = data.reduce((acc: any[], invoice) => {
        const date = new Date(invoice.invoice_date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        const existingMonth = acc.find((item) => item.month === monthYear);
        if (existingMonth) {
          existingMonth.amount += Number(invoice.amount);
        } else {
          acc.push({
            month: monthYear,
            amount: Number(invoice.amount),
          });
        }
        return acc;
      }, []);

      return monthlyData;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution du chiffre d'affaires</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenue}>
              <XAxis
                dataKey="month"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  `${value.toLocaleString("fr-CH", {
                    style: "currency",
                    currency: "CHF",
                    maximumFractionDigits: 0,
                  })}`
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Mois
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].payload.month}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Montant
                            </span>
                            <span className="font-bold">
                              {Number(payload[0].value).toLocaleString("fr-CH", {
                                style: "currency",
                                currency: "CHF",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};