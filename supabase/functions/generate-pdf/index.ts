
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

    // Fetch invoice data with its lines
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        invoice_lines (
          description,
          quantity,
          unit_price,
          total
        )
      `)
      .eq('id', invoice_id)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found')
    }

    // Create PDF
    const doc = new jsPDF()
    
    // Add company logo/header
    doc.setFontSize(20)
    doc.text(invoice.status === 'approved' ? 'FACTURE' : 'DEVIS', 105, 20, { align: 'center' })
    
    // Add invoice details
    doc.setFontSize(12)
    doc.text(`${invoice.status === 'approved' ? 'Facture' : 'Devis'} N°: ${invoice.invoice_number}`, 20, 40)
    doc.text(`Date: ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}`, 20, 50)
    
    // Add client details
    doc.text('Client:', 20, 70)
    doc.text(invoice.client_name, 20, 80)
    
    // Add services table header
    doc.line(20, 100, 190, 100)
    doc.text('Description', 20, 95)
    doc.text('Qté', 120, 95)
    doc.text('Prix Unit.', 140, 95)
    doc.text('Total CHF', 170, 95)
    doc.line(20, 97, 190, 97)
    
    // Add invoice lines
    let yPos = 110
    const lines = invoice.invoice_lines || []
    
    lines.forEach((line: any) => {
      // Description (with word wrap if needed)
      const words = line.description.split(' ')
      let currentLine = ''
      words.forEach((word: string) => {
        if ((currentLine + ' ' + word).length > 40) {
          doc.text(currentLine, 20, yPos)
          yPos += 6
          currentLine = word
        } else {
          currentLine += (currentLine ? ' ' : '') + word
        }
      })
      doc.text(currentLine, 20, yPos)
      
      // Quantity, unit price and total
      doc.text(line.quantity.toString(), 120, yPos)
      doc.text(line.unit_price.toFixed(2), 140, yPos)
      doc.text(line.total.toFixed(2), 170, yPos)
      yPos += 10
    })
    
    // Add totals
    doc.line(20, yPos, 190, yPos)
    yPos += 10
    doc.setFont(undefined, 'normal')
    doc.text('Total HT:', 140, yPos)
    doc.text(invoice.total_ht.toFixed(2), 170, yPos)
    
    yPos += 8
    doc.text(`TVA (${invoice.tva_rate}%):`, 140, yPos)
    doc.text((invoice.total_ttc - invoice.total_ht).toFixed(2), 170, yPos)
    
    yPos += 8
    doc.setFont(undefined, 'bold')
    doc.text('Total TTC:', 140, yPos)
    doc.text(invoice.total_ttc.toFixed(2), 170, yPos)
    
    // Add footer with payment details if it's an approved invoice
    if (invoice.status === 'approved') {
      yPos += 20
      doc.setFont(undefined, 'normal')
      doc.text('Coordonnées bancaires:', 20, yPos)
      yPos += 8
      doc.text('IBAN: CH00 0000 0000 0000 0000 0', 20, yPos)
      yPos += 8
      doc.text('BIC: XXXXXXXXXXXX', 20, yPos)
    }
    
    // Convert PDF to base64
    const pdfOutput = doc.output('arraybuffer')
    
    // Upload to Supabase Storage
    const fileName = `${invoice.status === 'approved' ? 'facture' : 'devis'}_${invoice.invoice_number}.pdf`
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
