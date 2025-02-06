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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-8">
      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardHeader className="p-2 md:p-6">
          <CardTitle className="text-sm md:text-2xl text-white">Chiffre d'affaires total</CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          <p className="text-base md:text-3xl font-bold text-white">
            {totalRevenue.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-background/80 backdrop-blur-sm border-white/10">
        <CardHeader className="p-2 md:p-6">
          <div className="flex items-center space-x-1 md:space-x-2">
            <FileText className="h-4 w-4 md:h-6 md:w-6 text-white" />
            <CardTitle className="text-sm md:text-2xl text-white">Total des factures</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          <p className="text-base md:text-3xl font-bold text-white">{totalInvoices}</p>
        </CardContent>
      </Card>

      <Card className="hidden md:block bg-background/80 backdrop-blur-sm border-white/10">
        <CardHeader className="p-2 md:p-6">
          <div className="flex items-center space-x-1 md:space-x-2">
            <Clock className="h-4 w-4 md:h-6 md:w-6 text-white" />
            <CardTitle className="text-sm md:text-2xl text-white">Date et Heure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-6 pt-0">
          <p className="text-xs md:text-xl font-medium text-white">
            {format(currentTime, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
          <p className="text-sm md:text-2xl font-bold text-white">
            {format(currentTime, "HH:mm:ss")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};