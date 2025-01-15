import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoiceList } from "@/components/InvoiceList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/Navigation";
import { RevenueChart } from "@/components/RevenueChart";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });
  }, [navigate]);

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Chiffre d'affaires total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {totalRevenue.toLocaleString('fr-CH', { style: 'currency', currency: 'CHF' })}
              </p>
            </CardContent>
          </Card>
          <RevenueChart />
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Factures</h2>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Facture
            </Button>
          </div>

          {showForm && <InvoiceForm onClose={() => setShowForm(false)} />}
          
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <InvoiceList invoices={invoices || []} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;