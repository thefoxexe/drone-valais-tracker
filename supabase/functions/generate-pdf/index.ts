
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
    console.log('Processing invoice_id:', invoice_id)

    if (!invoice_id) {
      throw new Error('Invoice ID is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Fetching invoice data...')
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

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError)
      throw new Error('Invoice not found')
    }

    if (!invoice) {
      console.error('No invoice found for id:', invoice_id)
      throw new Error('Invoice not found')
    }

    console.log('Creating PDF document...')
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
    
    // Convert PDF to array buffer
    console.log('Converting PDF to array buffer...')
    const pdfOutput = doc.output('arraybuffer')
    
    // Upload to Supabase Storage using the PDF bucket
    const fileName = `${invoice.status === 'approved' ? 'facture' : 'devis'}_${invoice.invoice_number}.pdf`
    console.log('Uploading PDF with filename:', fileName)
    
    // Vérifier si le fichier existe déjà et le supprimer si c'est le cas
    const { data: existingFile } = await supabaseClient.storage
      .from('PDF')
      .list('', {
        limit: 1,
        search: fileName
      })

    if (existingFile && existingFile.length > 0) {
      console.log('Removing existing file...')
      await supabaseClient.storage
        .from('PDF')
        .remove([fileName])
    }
    
    // Upload the new file
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('PDF')
      .upload(fileName, pdfOutput, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError)
      throw new Error(`Failed to upload PDF: ${uploadError.message}`)
    }

    console.log('Upload successful:', uploadData)

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('PDF')
      .getPublicUrl(fileName)

    console.log('Public URL generated:', publicUrl)

    // Update invoice with PDF path
    console.log('Updating invoice with PDF path...')
    const { error: updateError } = await supabaseClient
      .from('invoices')
      .update({ pdf_path: fileName })
      .eq('id', invoice_id)

    if (updateError) {
      console.error('Error updating invoice:', updateError)
      throw new Error('Failed to update invoice')
    }

    console.log('Successfully generated and stored PDF')
    // Return success response with PDF data
    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_path: fileName,
        public_url: publicUrl
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
        error: error.message,
        details: error.stack
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
