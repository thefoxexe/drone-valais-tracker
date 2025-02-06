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
    <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-3">
      <Card className="bg-[#D3E4FD]/80 backdrop-blur-sm border-white/10 transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-lg md:text-xl text-gray-800">Chiffre d'affaires total</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <p className="text-2xl md:text-3xl font-bold text-gray-900">
            {totalRevenue.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#FDE1D3]/80 backdrop-blur-sm border-white/10 transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
            <CardTitle className="text-lg md:text-xl text-gray-800">Total des factures</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{totalInvoices}</p>
        </CardContent>
      </Card>

      <Card className="bg-[#E5DEFF]/80 backdrop-blur-sm border-white/10 transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 md:h-6 md:w-6 text-gray-800" />
            <CardTitle className="text-lg md:text-xl text-gray-800">Date et Heure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <p className="text-base md:text-lg font-medium text-gray-800">
            {format(currentTime, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
            {format(currentTime, "HH:mm:ss")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};