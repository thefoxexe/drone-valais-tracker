import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStatsProps {
  totalRevenue: number;
  totalInvoices: number;
  currentTime: Date;
}

export const DashboardStats = ({ totalRevenue, totalInvoices, currentTime }: DashboardStatsProps) => {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Chiffre d'affaires total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-white">
            {totalRevenue.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-white" />
            <CardTitle className="text-white">Total des factures</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-white">{totalInvoices}</p>
        </CardContent>
      </Card>

      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-white" />
            <CardTitle className="text-white">Date et Heure</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-medium text-white">
            {format(currentTime, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
          <p className="text-2xl font-bold text-white">
            {format(currentTime, "HH:mm:ss")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};