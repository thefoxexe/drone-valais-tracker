
import { Card, CardContent } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueChartProps {
  data: any[] | undefined;
  isLoading: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p>Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <XAxis
            dataKey="created_at"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
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
                const date = new Date(payload[0].payload.created_at);
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Date
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {date.toLocaleDateString()}
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
  );
}
