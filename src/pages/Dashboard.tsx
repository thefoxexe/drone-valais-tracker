import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { InvoiceList } from "@/components/InvoiceList";
import { InvoiceForm } from "@/components/InvoiceForm";
import { RevenueChart } from "@/components/RevenueChart";

const Dashboard = () => {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleCloseForm = () => {
    setShowInvoiceForm(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onNewInvoice={handleNewInvoice} />
      <main className="container mx-auto p-4 space-y-4">
        <RevenueChart />
        {showInvoiceForm && (
          <InvoiceForm
            onClose={handleCloseForm}
            invoice={selectedInvoice}
          />
        )}
        <InvoiceList
          invoices={[]}
          onEdit={(invoice) => {
            setSelectedInvoice(invoice);
            setShowInvoiceForm(true);
          }}
          onNew={handleNewInvoice}
        />
      </main>
    </div>
  );
};

export default Dashboard;