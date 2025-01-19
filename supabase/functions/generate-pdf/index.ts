import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as pdf from 'https://deno.land/x/pdfkit@v0.3.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const data = await req.json()
    const {
      invoice_number,
      client_name,
      amount,
      invoice_date,
      description,
      rate_details,
    } = data

    // Créer un nouveau document PDF
    const doc = new pdf.default()
    const chunks: Uint8Array[] = []

    // Événement pour collecter les chunks de données
    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))

    // En-tête
    doc.fontSize(20).text('DEVIS', { align: 'center' })
    doc.moveDown()

    // Informations du devis
    doc.fontSize(12)
    doc.text(`Numéro de devis: ${invoice_number}`)
    doc.text(`Client: ${client_name}`)
    doc.text(`Date: ${new Date(invoice_date).toLocaleDateString('fr-CH')}`)
    doc.moveDown()

    // Description
    if (description) {
      doc.fontSize(14).text('Description', { underline: true })
      doc.fontSize(12).text(description)
      doc.moveDown()
    }

    // Détails du tarif
    if (rate_details) {
      doc.fontSize(14).text('Détails du tarif', { underline: true })
      doc.fontSize(12).text(rate_details)
      doc.moveDown()
    }

    // Montant total
    doc.fontSize(14).text('Montant total', { underline: true })
    doc.fontSize(12).text(`${amount.toLocaleString('fr-CH')} CHF`)

    // Finaliser le document
    doc.end()

    // Convertir les chunks en un seul Uint8Array
    const pdfBytes = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []))

    return new Response(
      pdfBytes,
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="devis_${invoice_number}.pdf"`
        }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la génération du PDF', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})