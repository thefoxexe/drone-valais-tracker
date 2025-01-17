import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceList } from "@/components/InvoiceList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/Navigation";
import { RevenueChart } from "@/components/RevenueChart";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les factures",
          variant: "destructive",
        });
        throw error;
      }

      return data;
    },
  });

  const totalRevenue = invoices?.reduce((sum, invoice) => sum + Number(invoice.amount), 0) || 0;
  const totalInvoices = invoices?.length || 0;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ 
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/lovable-uploads/deccad97-d3eb-4324-b51b-6bde7ebac742.png')"
      }}
    >
      <Navigation />
      <div className="container mx-auto py-8 px-4">
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

        <div className="mt-8">
          <Card className="bg-background/80 backdrop-blur-sm border-white/10">
            <RevenueChart />
          </Card>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Factures</h2>
            <Button onClick={() => setShowForm(true)} className="bg-white text-primary hover:bg-white/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Facture
            </Button>
          </div>

          {showForm && <InvoiceForm onClose={() => setShowForm(false)} />}
          
          {isLoading ? (
            <p className="text-white">Chargement...</p>
          ) : (
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <InvoiceList invoices={invoices || []} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;