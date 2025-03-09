
export interface ServiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  amount: number;
  invoice_date: string;
  pdf_path?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  description?: string;
  rate_details?: ServiceItem[];
  vat_rate?: number;
}
