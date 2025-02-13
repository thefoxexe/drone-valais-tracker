
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsPDF } from "https://esm.sh/jspdf@2.5.1"
import { format } from "https://esm.sh/date-fns@2.30.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { invoice_id } = await req.json()

    if (!invoice_id) {
      throw new Error('Invoice ID is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found')
    }

    // Create PDF
    const doc = new jsPDF()
    
    // Add company logo/header
    doc.setFontSize(20)
    doc.text('FACTURE', 105, 20, { align: 'center' })
    
    // Add invoice details
    doc.setFontSize(12)
    doc.text(`Facture N°: ${invoice.invoice_number}`, 20, 40)
    doc.text(`Date: ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}`, 20, 50)
    
    // Add client details
    doc.text('Client:', 20, 70)
    doc.text(invoice.client_name, 20, 80)
    
    // Add services table header
    doc.line(20, 100, 190, 100)
    doc.text('Description', 20, 95)
    doc.text('Montant CHF', 160, 95)
    doc.line(20, 97, 190, 97)
    
    // Add services
    let yPos = 110
    let total = 0
    const services = invoice.rate_details || []
    
    services.forEach((service: any) => {
      doc.text(service.description, 20, yPos)
      doc.text(service.amount.toFixed(2), 160, yPos, { align: 'right' })
      total += service.amount
      yPos += 10
    })
    
    // Add total
    doc.line(20, yPos, 190, yPos)
    yPos += 10
    doc.setFont(undefined, 'bold')
    doc.text('Total CHF:', 130, yPos)
    doc.text(total.toFixed(2), 160, yPos, { align: 'right' })
    
    // Convert PDF to base64
    const pdfOutput = doc.output('arraybuffer')
    
    // Upload to Supabase Storage
    const fileName = `invoice_${invoice.invoice_number}.pdf`
    const { error: uploadError } = await supabaseClient.storage
      .from('invoices')
      .upload(fileName, pdfOutput, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      throw new Error('Failed to upload PDF')
    }

    // Update invoice with PDF path
    const { error: updateError } = await supabaseClient
      .from('invoices')
      .update({ pdf_path: fileName })
      .eq('id', invoice_id)

    if (updateError) {
      throw new Error('Failed to update invoice')
    }

    // Return success response with PDF data
    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_path: fileName 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error generating PDF:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    )
  }
})
