
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
    // Vérifier que la méthode est POST
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { invoice_id } = await req.json()

    if (!invoice_id) {
      throw new Error('Invoice ID is required')
    }

    console.log(`Generating PDF for invoice ID: ${invoice_id}`)

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('id', invoice_id)
      .single()

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError)
      throw new Error('Invoice not found')
    }

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    console.log(`Found invoice: ${invoice.invoice_number}`)

    // Vérifier que le bucket 'invoices' existe
    const { data: buckets, error: bucketsError } = await supabaseClient
      .storage
      .listBuckets()

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      throw new Error('Failed to list storage buckets')
    }

    // Liste des buckets pour faciliter le debug
    console.log('Available buckets:', buckets.map(b => b.id).join(', '))
    
    // Vérifier si le bucket 'invoices' existe
    const invoicesBucket = buckets.find(bucket => bucket.id === 'invoices')
    
    if (!invoicesBucket) {
      console.error('Bucket "invoices" not found')
      
      // Création automatique du bucket s'il n'existe pas
      const { error: createBucketError } = await supabaseClient
        .storage
        .createBucket('invoices', { public: true })
        
      if (createBucketError) {
        console.error('Error creating bucket:', createBucketError)
        throw new Error('Failed to create "invoices" bucket')
      }
      console.log('Created "invoices" bucket')
    } else {
      console.log('Bucket "invoices" exists')
    }

    // Create PDF
    const doc = new jsPDF()
    
    // Add company logo/header
    doc.setFontSize(20)
    doc.text(invoice.status === 'pending' ? 'DEVIS' : 'FACTURE', 105, 20, { align: 'center' })
    
    // Add invoice details
    doc.setFontSize(12)
    doc.text(`${invoice.status === 'pending' ? 'Devis' : 'Facture'} N°: ${invoice.invoice_number}`, 20, 40)
    doc.text(`Date: ${format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}`, 20, 50)
    
    // Add client details
    doc.text('Client:', 20, 70)
    doc.text(invoice.client_name, 20, 80)
    
    // Add services table header
    doc.line(20, 100, 190, 100)
    doc.text('Description', 20, 95)
    doc.text('Prix', 130, 95)
    doc.text('Qté', 150, 95)
    doc.text('Montant CHF', 180, 95, { align: 'right' })
    doc.line(20, 97, 190, 97)
    
    // Add services
    let yPos = 110
    let services = []
    
    // Transformation des rate_details en tableau si c'est une chaîne JSON
    if (typeof invoice.rate_details === 'string') {
      try {
        services = JSON.parse(invoice.rate_details)
      } catch (e) {
        console.error('Failed to parse rate_details:', e)
        services = []
      }
    } else if (Array.isArray(invoice.rate_details)) {
      services = invoice.rate_details
    } else {
      console.warn('rate_details is not an array or JSON string:', invoice.rate_details)
    }
    
    let subtotal = 0
    
    if (Array.isArray(services)) {
      services.forEach((service) => {
        doc.text(service.description, 20, yPos)
        doc.text(service.amount.toFixed(2), 130, yPos)
        doc.text(service.quantity.toString(), 150, yPos)
        const amount = service.amount * service.quantity
        subtotal += amount
        doc.text(amount.toFixed(2), 180, yPos, { align: 'right' })
        yPos += 10
      })
    } else {
      console.warn('services is not an array:', services)
    }
    
    // Add subtotal
    yPos += 5
    doc.line(20, yPos - 3, 190, yPos - 3)
    doc.text('Sous-total CHF:', 130, yPos)
    doc.text(subtotal.toFixed(2), 180, yPos, { align: 'right' })
    
    // Add VAT
    yPos += 10
    const vatRate = invoice.vat_rate || 8.1
    const vatAmount = subtotal * (vatRate / 100)
    doc.text(`TVA (${vatRate}%) CHF:`, 130, yPos)
    doc.text(vatAmount.toFixed(2), 180, yPos, { align: 'right' })
    
    // Add total
    yPos += 10
    const total = subtotal + vatAmount
    doc.setFont(undefined, 'bold')
    doc.text('Total CHF:', 130, yPos)
    doc.text(total.toFixed(2), 180, yPos, { align: 'right' })
    
    // Add footer with payment information if it's an invoice
    if (invoice.status === 'approved') {
      yPos += 30
      doc.setFont(undefined, 'normal')
      doc.text('Conditions de paiement: 30 jours net', 20, yPos)
      yPos += 10
      doc.text('Informations bancaires:', 20, yPos)
      yPos += 10
      doc.text('IBAN: CH00 0000 0000 0000 0000 0', 20, yPos)
      yPos += 10
      doc.text('Bénéficiaire: Votre société', 20, yPos)
    }
    
    // Convert PDF to base64
    const pdfOutput = doc.output('arraybuffer')
    
    // Upload to Supabase Storage
    const fileName = `${invoice.status === 'pending' ? 'devis' : 'facture'}_${invoice.invoice_number}.pdf`
    
    console.log(`Attempting to upload PDF with filename: ${fileName}`)
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('invoices')
      .upload(fileName, pdfOutput, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError)
      throw new Error(`Failed to upload PDF: ${uploadError.message}`)
    }

    console.log(`PDF uploaded successfully: ${fileName}`)

    // Update invoice with PDF path
    const { error: updateError } = await supabaseClient
      .from('invoices')
      .update({ pdf_path: fileName })
      .eq('id', invoice_id)

    if (updateError) {
      console.error('Error updating invoice:', updateError)
      throw new Error('Failed to update invoice')
    }

    console.log(`Invoice updated with PDF path: ${fileName}`)
    
    // Récupérer et vérifier l'URL publique
    const { data: publicUrlData } = await supabaseClient.storage
      .from('invoices')
      .getPublicUrl(fileName)
      
    console.log(`Public URL: ${publicUrlData?.publicUrl}`)

    // Return success response with PDF data
    return new Response(
      JSON.stringify({ 
        success: true, 
        pdf_path: fileName,
        publicUrl: publicUrlData?.publicUrl
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
