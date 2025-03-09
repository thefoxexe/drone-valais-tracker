
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { InvoiceForm } from "@/components/InvoiceForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Navigation } from "@/components/Navigation";
import { RevenueChart } from "@/components/RevenueChart";
import { useNavigate } from "react-router-dom";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { Footer } from "@/components/Footer";

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

  const { data: allInvoices, isLoading } = useQuery({
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

  const invoices = allInvoices?.filter(invoice => invoice.status === 'approved') || [];
  const pendingQuotes = allInvoices?.filter(invoice => invoice.status === 'pending') || [];
  const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const totalInvoices = invoices.length;
  const totalQuotes = pendingQuotes.length;

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed flex flex-col"
      style={{ 
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/lovable-uploads/deccad97-d3eb-4324-b51b-6bde7ebac742.png')"
      }}
    >
      <Navigation />
      <div className="container mx-auto py-8 px-4 flex-grow">
        <DashboardStats 
          totalRevenue={totalRevenue}
          totalInvoices={totalInvoices}
          currentTime={currentTime}
        />

        <div className="mt-8">
          <Card className="bg-background/80 backdrop-blur-sm border-white/10">
            <RevenueChart />
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-background/80 backdrop-blur-sm border-white/10 p-6">
            <DashboardTabs
              totalQuotes={totalQuotes}
              totalInvoices={totalInvoices}
              invoices={allInvoices || []}
            />
          </Card>
        </div>

        {showForm && <InvoiceForm onClose={() => setShowForm(false)} />}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
